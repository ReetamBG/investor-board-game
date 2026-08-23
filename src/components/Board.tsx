import { useState } from "react";
import type { EventCard } from "../game/gameLogic";
import {
  createGamePlayers,
  formatCash,
  playResultPhase,
  resolveTile,
  WINNING_CASH,
  type GamePlayer,
} from "../game/gameLogic";
import { movePlayer } from "../game/playerLogic";
import BoardGrid from "./BoardGrid";
import PlayerPanel from "./PlayerPanel";

const Board = () => {
  const [gamePlayers, setGamePlayers] = useState(createGamePlayers);
  const [activePlayer, setActivePlayer] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundEvents, setRoundEvents] = useState<EventCard[]>([]);
  const [lastRolls, setLastRolls] = useState<Record<number, number | null>>({
    1: null,
    2: null,
  });
  const [winner, setWinner] = useState<GamePlayer | null>(null);
  // Player on final bailout countdown: rounds remaining (starts at 3)
  const [countdownPlayerId, setCountdownPlayerId] = useState<number | null>(
    null,
  );
  const [countdownRounds, setCountdownRounds] = useState(0);

  const handleRollDie = () => {
    if (winner) return;

    const dieRoll = Math.floor(Math.random() * 6) + 1;
    const playersCopy: GamePlayer[] = gamePlayers.map((p) => ({
      ...p,
      investments: p.investments.map((inv) => ({ ...inv })),
    }));
    const eventsCopy = [...roundEvents];
    const currentPlayer = playersCopy[activePlayer];

    currentPlayer.position = movePlayer(currentPlayer.position, dieRoll);

    // Resolve the landed tile
    const usedFinalBailout = resolveTile(currentPlayer, eventsCopy);

    setLastRolls((prev) => ({ ...prev, [currentPlayer.id]: dieRoll }));

    let nextCountdownPlayerId = countdownPlayerId;
    let nextCountdownRounds = countdownRounds;
    if (usedFinalBailout) {
      nextCountdownPlayerId = currentPlayer.id;
      nextCountdownRounds = 3;
      setCountdownPlayerId(nextCountdownPlayerId);
      setCountdownRounds(nextCountdownRounds);
    }

    // Immediate win check
    const immediateWinner = playersCopy.find(
      (p) => p.cash >= WINNING_CASH,
    );
    if (immediateWinner) {
      setGamePlayers(playersCopy);
      setRoundEvents(eventsCopy);
      setWinner(immediateWinner);
      window.alert(
        `${immediateWinner.name} wins with ${formatCash(immediateWinner.cash)}!`,
      );
      return;
    }

    const nextTurn = turnCount + 1;

    if (nextTurn % 4 === 0) {
      // Round complete -> Result Phase
      playResultPhase(playersCopy, eventsCopy);

      // Win check after results
      const resultWinner =
        playersCopy.find((p) => p.cash >= WINNING_CASH) || null;

      // Bailout countdown handling at end of round
      let loser: GamePlayer | null = null;
      if (!resultWinner && nextCountdownPlayerId !== null) {
        const remaining = nextCountdownRounds - 1;
        const countdownPlayer = playersCopy.find(
          (p) => p.id === nextCountdownPlayerId,
        );
        if (remaining <= 0 && countdownPlayer && countdownPlayer.cash < WINNING_CASH) {
          loser = playersCopy.find((p) => p.id !== nextCountdownPlayerId)!;
        } else {
          nextCountdownRounds = remaining;
          setCountdownRounds(remaining);
          window.alert(
            `${countdownPlayer?.name} has ${remaining} round(s) left to reach ${formatCash(WINNING_CASH)}!`,
          );
        }
      }

      setGamePlayers(playersCopy);
      setRoundEvents([]);
      setTurnCount(nextTurn);
      setRoundNumber((r) => r + 1);
      setActivePlayer(0);

      const finalWinner = resultWinner || loser;
      if (finalWinner) {
        setCountdownPlayerId(null);
        setWinner(finalWinner);
        window.alert(
          resultWinner
            ? `${resultWinner.name} wins with ${formatCash(resultWinner.cash)}!`
            : `Time's up! ${loser?.name} wins because the other player ran out of bailout rounds.`,
        );
      }
    } else {
      setGamePlayers(playersCopy);
      setRoundEvents(eventsCopy);
      setTurnCount(nextTurn);
      setActivePlayer((prev) => (prev + 1) % playersCopy.length);
    }
  };

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center gap-8 px-6 py-8">
        {/* Player A */}
        <PlayerPanel
          player={gamePlayers[0]}
          isActive={!winner && activePlayer === 0}
          lastRoll={lastRolls[gamePlayers[0].id] ?? null}
          onRoll={handleRollDie}
        />

        {/* Center Board */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-3">
          <BoardGrid players={gamePlayers} />
          <p className="text-sm font-medium text-stone-400">
            Round {roundNumber}
            {roundEvents.length > 0 && " • Active event this round!"}
            {countdownPlayerId !== null && !winner && (
              <span className="ml-2 text-red-400">
                P{countdownPlayerId} must win in {countdownRounds} round(s)!
              </span>
            )}
            {winner && (
              <span className="ml-2 text-emerald-400">
                🏆 {winner.name} wins!
              </span>
            )}
          </p>
        </div>

        {/* Player B */}
        <PlayerPanel
          player={gamePlayers[1]}
          isActive={!winner && activePlayer === 1}
          lastRoll={lastRolls[gamePlayers[1].id] ?? null}
          onRoll={handleRollDie}
        />
      </div>
    </main>
  );
};

export default Board;
