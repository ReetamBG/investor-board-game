import startupCards from "../data/startupCards";
import eventCards from "../data/eventCards";
import resultCards from "../data/resultsCards";
import { TILES } from "../data/tiles";
import { createPlayers, type Player } from "./playerLogic";

export type StartupCard = (typeof startupCards)[number];
export type EventCard = (typeof eventCards)[number];
export type ResultCard = (typeof resultCards)[number];

export type Investment = {
  title: string;
  amount: number;
};

export type GamePlayer = Player & {
  cash: number;
  bailoutsLeft: number;
  investments: Investment[];
};

export type GameIO = {
  revealStartupCard(
    card: StartupCard,
    playerName: string,
  ): Promise<boolean>;
  revealEventCard(card: EventCard, playerName: string): Promise<void>;
  revealResultCard(
    card: ResultCard,
    playerName: string,
    investment: Investment,
  ): Promise<void>;
  alert(title: string, description?: string): Promise<void>;
  askBailout(
    playerName: string,
    card: StartupCard,
    bailoutsLeft: number,
  ): Promise<boolean>;
};

export const STARTING_CASH = 7000;
export const WINNING_CASH = 25000;
export const BAILOUT_CASH = 4000;

export const formatCash = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

export const pickRandom = <T,>(cards: T[]): T =>
  cards[Math.floor(Math.random() * cards.length)];

export const createGamePlayers = (): GamePlayer[] =>
  createPlayers().map((player) => ({
    ...player,
    cash: STARTING_CASH,
    bailoutsLeft: 3,
    investments: [],
  }));

export const resolveTile = async (
  player: GamePlayer,
  roundEvents: EventCard[],
  io: GameIO,
): Promise<boolean> => {
  const tile = TILES[player.position];

  switch (tile.category) {
    case "Startup": {
      const card = pickRandom(startupCards);
      const wantsToInvest = await io.revealStartupCard(card, player.name);

      if (!wantsToInvest) return false;

      if (player.cash >= card.investmentAmount) {
        player.cash -= card.investmentAmount;
        player.investments.push({
          title: card.title,
          amount: card.investmentAmount,
        });
        return false;
      }

      const canAffordWithBailout =
        player.bailoutsLeft > 0 &&
        player.cash + BAILOUT_CASH >= card.investmentAmount;

      if (canAffordWithBailout) {
        const useBailout = await io.askBailout(
          player.name,
          card,
          player.bailoutsLeft - 1,
        );

        if (useBailout) {
          player.bailoutsLeft -= 1;
          player.cash += BAILOUT_CASH;
          player.cash -= card.investmentAmount;
          player.investments.push({
            title: card.title,
            amount: card.investmentAmount,
          });

          const usedFinalBailout = player.bailoutsLeft === 0;
          await io.alert(
            usedFinalBailout ? "Last Bailout Card Used!" : "Bailout Card Used",
            `${player.name} used a Bailout Card and invested in ${card.title}.` +
              (usedFinalBailout
                ? `\n\nOnly 3 rounds left to reach ${formatCash(WINNING_CASH)}!`
                : ""),
          );
          return usedFinalBailout;
        }
      }

      return false;
    }

    case "Event": {
      const card = pickRandom(eventCards);
      roundEvents.push(card);
      await io.revealEventCard(card, player.name);
      return false;
    }

    case "Crash": {
      if (player.investments.length > 0) {
        const lostAmount = player.investments.reduce(
          (s, inv) => s + inv.amount,
          0,
        );
        player.investments = [];
        await io.alert(
          "CRASH!",
          `${player.name} lost all investments (${formatCash(lostAmount)}). Remaining cash: ${formatCash(player.cash)}.`,
        );
      }
      return false;
    }

    case "Funding": {
      player.cash += 2000;
      return false;
    }

    case "Start here →": {
      player.cash += 7000;
      return false;
    }

    default:
      return false;
  }
};

export const playResultPhase = async (
  players: GamePlayer[],
  roundEvents: EventCard[],
  io: GameIO,
) => {
  const returnMultiplier = roundEvents
    .filter((e) => e.effectType === "multiply_returns")
    .reduce((acc, e) => acc * e.effectValue, 1);

  const eventCashDelta = roundEvents.reduce((sum, e) => {
    if (e.effectType === "add_cash") return sum + e.effectValue;
    if (e.effectType === "reduce_cash") return sum - e.effectValue;
    return sum;
  }, 0);

  if (roundEvents.length > 0) {
    await io.alert("Result Phase", "Resolving round results...");
    if (eventCashDelta !== 0) {
      players.forEach((p) => {
        p.cash += eventCashDelta;
      });
      await io.alert(
        "Event Effect",
        `Every player's cash changed by ${formatCash(eventCashDelta)}.`,
      );
    }
    if (returnMultiplier !== 1) {
      await io.alert(
        "Event Effect",
        `All startup returns this round are multiplied x${returnMultiplier}.`,
      );
    }
  }

  for (const player of players) {
    for (const investment of player.investments) {
      const card = pickRandom(resultCards);
      await io.revealResultCard(card, player.name, investment);
      const baseReturn = investment.amount * card.effectValue;
      const totalReturn = baseReturn * returnMultiplier;
      player.cash += totalReturn;
    }
    player.investments = [];
  }
};
