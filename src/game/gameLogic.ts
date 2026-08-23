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
export const resolveTile = (
  player: GamePlayer,
  roundEvents: EventCard[],
): boolean => {
  const tile = TILES[player.position];

  switch (tile.category) {
    case "Startup": {
      const card = pickRandom(startupCards);

      const wantsToInvest = window.confirm(
        `${player.name} drew a Startup Card!\n\n` +
          `${card.title}\n${card.description}\n\n` +
          `Risk: ${card.risk}\n` +
          `Investment required: ${formatCash(card.investmentAmount)}\n\n` +
          `Do you want to invest? (OK = Yes, Cancel = No)`,
      );

      if (!wantsToInvest) {
        window.alert(`${player.name} chose not to invest.`);
        return false;
      }

      if (player.cash >= card.investmentAmount) {
        player.cash -= card.investmentAmount;
        player.investments.push({
          title: card.title,
          amount: card.investmentAmount,
        });
        window.alert(
          `${player.name} invested ${formatCash(card.investmentAmount)} in ${card.title}.\n` +
            `Remaining cash: ${formatCash(player.cash)}`,
        );
        return false;
      }

      // Not enough cash -> offer bailout
      const canAffordWithBailout =
        player.bailoutsLeft > 0 &&
        player.cash + BAILOUT_CASH >= card.investmentAmount;

      if (
        canAffordWithBailout &&
        window.confirm(
          `${player.name} has ${formatCash(player.cash)} but needs ${formatCash(card.investmentAmount)}.\n\n` +
            `Use a Bailout Card? (+${formatCash(BAILOUT_CASH)})\n` +
            `${player.bailoutsLeft - 1} will be left after use.`,
        )
      ) {
        player.bailoutsLeft -= 1;
        player.cash += BAILOUT_CASH;
        player.cash -= card.investmentAmount;
        player.investments.push({
          title: card.title,
          amount: card.investmentAmount,
        });

        const usedFinalBailout = player.bailoutsLeft === 0;
        window.alert(
          `Bailout Card used! ${player.name} invested ${formatCash(card.investmentAmount)} in ${card.title}.` +
            (usedFinalBailout ? `\n\nThat was the LAST bailout card! 3 rounds to reach ${formatCash(WINNING_CASH)}!` : ""),
        );
        return usedFinalBailout;
      }

      window.alert(
        `${player.name} cannot afford this investment and skipped it.`,
      );
      return false;
    }

    case "Event": {
      const card = pickRandom(eventCards);
      roundEvents.push(card);
      window.alert(
        `${player.name} drew an Event Card!\n\n${card.title}\n${card.condition}`,
      );
      return false;
    }

    case "Crash": {
      if (player.investments.length > 0) {
        const lostAmount = player.investments.reduce(
          (sum, inv) => sum + inv.amount,
          0,
        );
        player.investments = [];
        window.alert(
          `CRASH! ${player.name} lost all current investments ` +
            `(${formatCash(lostAmount)} across startups). No result cards for them.\n` +
            `Remaining cash: ${formatCash(player.cash)}`,
        );
      } else {
        window.alert(
          `CRASH! But ${player.name} had no active investments. Nothing lost.`,
        );
      }
      return false;
    }

    case "Funding": {
      player.cash += 2000;
      window.alert(
        `${player.name} received ${formatCash(2000)} funding!\n` +
          `New cash: ${formatCash(player.cash)}`,
      );
      return false;
    }

    case "Start here →": {
      player.cash += 7000;
      window.alert(
        `${player.name} landed on Start and collected ${formatCash(7000)}!\n` +
          `New cash: ${formatCash(player.cash)}`,
      );
      return false;
    }

    default:
      return false;
  }
};

/**
 * End-of-round result phase.
 * Applies event effects + one result card per owned startup, via alerts.
 */
export const playResultPhase = (
  players: GamePlayer[],
  roundEvents: EventCard[],
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

  if (roundEvents.length > 0) {
    window.alert("--- RESULT PHASE ---");
    if (eventCashDelta !== 0) {
      players.forEach((p) => {
        p.cash += eventCashDelta;
      });
      window.alert(
        `Event effect: every player's cash changed by ${formatCash(eventCashDelta)}.`,
      );
    }
    if (returnMultiplier !== 1) {
      window.alert(
        `Event effect: all startup returns this round are multiplied x${returnMultiplier}.`,
      );
    }
  }

  players.forEach((player) => {
    player.investments.forEach((investment) => {
      const card = pickRandom(resultCards);
      const baseReturn = investment.amount * card.effectValue;
      const totalReturn = baseReturn * returnMultiplier;
      player.cash += totalReturn;

      window.alert(
        `${player.name} - ${investment.title} (${formatCash(investment.amount)}):\n` +
          `Result Card: ${card.title}\n` +
          `Return: ${formatCash(totalReturn)}\n` +
          `Total cash: ${formatCash(player.cash)}`,
      );
    });
    player.investments = [];
  });
};
