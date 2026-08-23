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

/**
 * UI bridge: lets the pure game logic await player decisions
 * rendered as shadcn dialogs.
 */
export type GameIO = {
  alert(title: string, description?: string): Promise<void>;
  askInvest(playerName: string, card: StartupCard): Promise<boolean>;
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

/**
 * Resolves the tile the player landed on.
 * Mutates the player (cash / investments / bailouts) and roundEvents.
 * Returns true if the player just used their FINAL (3rd) bailout card.
 */
export const resolveTile = async (
  player: GamePlayer,
  roundEvents: EventCard[],
  io: GameIO,
): Promise<boolean> => {
  const tile = TILES[player.position];

  switch (tile.category) {
    case "Startup": {
      const card = pickRandom(startupCards);

      const wantsToInvest = await io.askInvest(player.name, card);

      if (!wantsToInvest) {
        await io.alert(
          "No Investment",
          `${player.name} chose not to invest in ${card.title}.`,
        );
        return false;
      }

      if (player.cash >= card.investmentAmount) {
        player.cash -= card.investmentAmount;
        player.investments.push({
          title: card.title,
          amount: card.investmentAmount,
        });
        await io.alert(
          "Investment Made",
          `${player.name} invested ${formatCash(card.investmentAmount)} in ${card.title}. Remaining cash: ${formatCash(player.cash)}.`,
        );
        return false;
      }

      // Not enough cash -> offer bailout
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
            `${player.name} used a Bailout Card (+${formatCash(BAILOUT_CASH)}) and invested ${formatCash(card.investmentAmount)} in ${card.title}.` +
              (usedFinalBailout
                ? `\n\nThat was the LAST bailout card! Only 3 rounds left to reach ${formatCash(WINNING_CASH)}!`
                : ""),
          );
          return usedFinalBailout;
        }
      }

      await io.alert(
        "Skipped",
        `${player.name} cannot afford this investment and skipped it.`,
      );
      return false;
    }

    case "Event": {
      const card = pickRandom(eventCards);
      roundEvents.push(card);
      await io.alert(`Event Card: ${card.title}`, card.condition);
      return false;
    }

    case "Crash": {
      if (player.investments.length > 0) {
        const lostAmount = player.investments.reduce(
          (sum, inv) => sum + inv.amount,
          0,
        );
        player.investments = [];
        await io.alert(
          "CRASH!",
          `${player.name} lost all current investments (${formatCash(lostAmount)} across startups). No result cards for them. Remaining cash: ${formatCash(player.cash)}.`,
        );
      } else {
        await io.alert(
          "CRASH!",
          `${player.name} had no active investments. Nothing lost.`,
        );
      }
      return false;
    }

    case "Funding": {
      player.cash += 2000;
      await io.alert(
        "Funding Received",
        `${player.name} received ${formatCash(2000)} funding! New cash: ${formatCash(player.cash)}.`,
      );
      return false;
    }

    case "Start here →": {
      player.cash += 7000;
      await io.alert(
        "Back to Start",
        `${player.name} landed on Start and collected ${formatCash(7000)}! New cash: ${formatCash(player.cash)}.`,
      );
      return false;
    }

    default:
      return false;
  }
};

/**
 * End-of-round result phase.
 * Applies event effects + one result card per owned startup.
 */
export const playResultPhase = async (
  players: GamePlayer[],
  roundEvents: EventCard[],
  io: GameIO,
) => {
  // Aggregate event effects for this round
  const returnMultiplier = roundEvents
    .filter((e) => e.effectType === "multiply_returns")
    .reduce((acc, e) => acc * e.effectValue, 1);

  const eventCashDelta = roundEvents.reduce((sum, e) => {
    if (e.effectType === "add_cash") return sum + e.effectValue;
    if (e.effectType === "reduce_cash") return sum - e.effectValue;
    return sum;
  }, 0);

  await io.alert("Result Phase", "The round has ended. Resolving results...");

  if (roundEvents.length > 0) {
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
      const baseReturn = investment.amount * card.effectValue;
      const totalReturn = baseReturn * returnMultiplier;
      player.cash += totalReturn;

      await io.alert(
        `${card.title} — ${investment.title}`,
        `${player.name}'s ${investment.title} (${formatCash(investment.amount)}): ${card.description}\n\nReturn: ${formatCash(totalReturn)} • Total cash: ${formatCash(player.cash)}`,
      );
    }
    player.investments = [];
  }
};
