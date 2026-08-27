import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CardReveal from "@/components/CardReveal";
import BoardGrid from "@/components/BoardGrid";
import GameDialog, { type PendingDialog } from "@/components/GameDialog";
import PlayerPanel from "@/components/PlayerPanel";
import type { EventCard, GameIO, GamePlayer } from "@/game/gameLogic";
import {
  createGamePlayers,
  formatCash,
  playResultPhase,
  resolveTile,
  WINNING_CASH,
} from "@/game/gameLogic";
import { movePlayer } from "@/game/playerLogic";

type CardRevealState = {
  cardType: "startup" | "event" | "result";
  card: { id: string };
  playerName: string;
  investment?: { title: string; amount: number };
  resolve: (value?: any) => void;
};

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
  const [busy, setBusy] = useState(false);
  const [countdownPlayerId, setCountdownPlayerId] = useState<number | null>(
    null,
  );
  const [countdownRounds, setCountdownRounds] = useState(0);

  // Card reveal overlay
  const [cardReveal, setCardReveal] = useState<CardRevealState | null>(null);
  // Dialog overlay
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );
  const resolverRef = useRef<((value?: boolean) => void) | null>(null);

  const settleDialog = (value?: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setPendingDialog(null);
    resolver?.(value);
  };

  const ioWithPlayers = (players: GamePlayer[]): GameIO => ({
    revealStartupCard: (card, playerName) =>
      new Promise<boolean>((resolve) => {
        setCardReveal({
          cardType: "startup",
          card,
          playerName,
          resolve,
        });
      }),
    revealEventCard: (card, playerName) =>
      new Promise<void>((resolve) => {
        setCardReveal({
          cardType: "event",
          card,
          playerName,
          resolve,
        });
      }),
    revealResultCard: (card, playerName, investment) =>
      new Promise<void>((resolve) => {
        setCardReveal({
          cardType: "result",
          card,
          playerName,
          investment,
          resolve,
        });
      }),
    alert: (title, description) =>
      new Promise<void>((resolve) => {
        resolverRef.current = () => resolve();
        setPendingDialog({ kind: "alert", title, description });
      }),
    askBailout: (playerName, card, bailoutsLeft) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = (value) => resolve(Boolean(value));
        setPendingDialog({
          kind: "bailout",
          card,
          bailoutsLeft,
          player: players.find((p) => p.name === playerName)!,
        });
      }),
  });

  const handleRollDie = async () => {
    if (winner || busy) return;
    setBusy(true);

    try {
      const dieRoll = Math.floor(Math.random() * 6) + 1;
      const playersCopy: GamePlayer[] = gamePlayers.map((p) => ({
        ...p,
        investments: p.investments.map((inv) => ({ ...inv })),
      }));
      const eventsCopy = [...roundEvents];
      const currentPlayer = playersCopy[activePlayer];

      currentPlayer.position = movePlayer(currentPlayer.position, dieRoll);
      setLastRolls((prev) => ({ ...prev, [currentPlayer.id]: dieRoll }));

      // Commit the move so the piece animates to the new tile
      setGamePlayers(playersCopy);
      setRoundEvents(eventsCopy);

      // Wait for piece movement animation to finish before resolving tile
      await new Promise((r) => setTimeout(r, 1200));

      const usedFinalBailout = await resolveTile(
        currentPlayer,
        eventsCopy,
        ioWithPlayers(playersCopy),
      );

      let nextCountdownPlayerId = countdownPlayerId;
      let nextCountdownRounds = countdownRounds;
      if (usedFinalBailout) {
        nextCountdownPlayerId = currentPlayer.id;
        nextCountdownRounds = 3;
        setCountdownPlayerId(nextCountdownPlayerId);
        setCountdownRounds(nextCountdownRounds);
      }

      const commitState = () => {
        setGamePlayers(playersCopy);
        setRoundEvents(eventsCopy);
      };

      const immediateWinner =
        playersCopy.find((p) => p.cash >= WINNING_CASH) || null;
      if (immediateWinner) {
        commitState();
        setWinner(immediateWinner);
        return;
      }

      const nextTurn = turnCount + 1;

      if (nextTurn % 4 === 0) {
        const phaseIO = ioWithPlayers(playersCopy);
        await playResultPhase(playersCopy, eventsCopy, phaseIO);

        const resultWinner =
          playersCopy.find((p) => p.cash >= WINNING_CASH) || null;

        let loser: GamePlayer | null = null;
        if (!resultWinner && nextCountdownPlayerId !== null) {
          const remaining = nextCountdownRounds - 1;
          const countdownPlayer = playersCopy.find(
            (p) => p.id === nextCountdownPlayerId,
          );
          if (
            remaining <= 0 &&
            countdownPlayer &&
            countdownPlayer.cash < WINNING_CASH
          ) {
            loser = playersCopy.find((p) => p.id !== nextCountdownPlayerId)!;
          } else {
            nextCountdownRounds = remaining;
            setCountdownRounds(remaining);
          }
        }

        commitState();
        setRoundEvents([]);
        setTurnCount(nextTurn);
        setRoundNumber((r) => r + 1);
        setActivePlayer(0);

        const finalWinner = resultWinner || loser;
        if (finalWinner) {
          setCountdownPlayerId(null);
          setWinner(finalWinner);
        }
      } else {
        commitState();
        setTurnCount(nextTurn);
        setActivePlayer((prev) => (prev + 1) % playersCopy.length);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center gap-8 px-6 py-8">
        {/* Player A */}
        <PlayerPanel
          player={gamePlayers[0]}
          isActive={!winner && !busy && activePlayer === 0}
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
                {winner.name} wins!
              </span>
            )}
          </p>
        </div>

        {/* Player B */}
        <PlayerPanel
          player={gamePlayers[1]}
          isActive={!winner && !busy && activePlayer === 1}
          lastRoll={lastRolls[gamePlayers[1].id] ?? null}
          onRoll={handleRollDie}
        />
      </div>

      {/* Card reveal overlay */}
      <AnimatePresence>
        {cardReveal && (
          <CardReveal
            key={cardReveal.card.id}
            cardType={cardReveal.cardType}
            card={cardReveal.card}
            playerName={cardReveal.playerName}
            investment={cardReveal.investment}
            resolve={(value?: any) => {
              cardReveal.resolve(value);
              setCardReveal(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Dialog overlay */}
      <GameDialog dialog={pendingDialog} onSettle={settleDialog} />
    </main>
  );
};

export default Board;
