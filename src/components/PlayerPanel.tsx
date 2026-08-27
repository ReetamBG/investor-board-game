import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCash, type GamePlayer } from "../game/gameLogic";
import Die3D from "./Die3D";

type PlayerPanelProps = {
  player: GamePlayer;
  isActive: boolean;
  lastRoll: number | null;
  onRoll: () => void;
};

const scrambleNumber = (target: number, progress: number): string => {
  if (progress >= 1) return formatCash(target);

  const targetStr = formatCash(target);
  let result = "";
  let digitIndex = 0;
  const totalDigits = targetStr.replace(/[^0-9]/g, "").length;

  for (let i = 0; i < targetStr.length; i++) {
    const char = targetStr[i];

    if (!/[0-9]/.test(char)) {
      result += char;
      continue;
    }

    const settleThreshold = 0.2 + (digitIndex / totalDigits) * 0.7;

    if (progress > settleThreshold) {
      result += char;
    } else {
      result += Math.floor(Math.random() * 10).toString();
    }

    digitIndex++;
  }

  return result;
};

const PlayerPanel = ({
  player,
  isActive,
  lastRoll,
  onRoll,
}: PlayerPanelProps) => {
  const isPlayerOne = player.id === 1;

  const [displayedValue, setDisplayedValue] = useState(() =>
    formatCash(player.cash),
  );
  const [cashDelta, setCashDelta] = useState<{
    amount: number;
    key: number;
  } | null>(null);
  const prevCashRef = useRef(player.cash);

  useEffect(() => {
    if (player.cash !== prevCashRef.current) {
      const start = prevCashRef.current;
      const end = player.cash;
      const delta = end - start;

      setCashDelta({ amount: delta, key: Date.now() });

      const clearTimer = setTimeout(() => setCashDelta(null), 3000);

      const duration = 1500;
      const startTime = Date.now();
      let animationId: number;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setDisplayedValue(scrambleNumber(end, eased));

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animationId = requestAnimationFrame(animate);
      prevCashRef.current = player.cash;

      return () => {
        clearTimeout(clearTimer);
        cancelAnimationFrame(animationId);
      };
    }
  }, [player.cash]);

  return (
    <aside
      className={`flex h-full min-h-[720px] w-full max-w-[280px] flex-col px-2 py-4 text-white ${
        isPlayerOne ? "items-start" : "items-start"
      }`}
    >
      {/* Player Header */}
      <div className="mb-5 flex items-center gap-3">
        <h2 className="font-inter text-2xl font-semibold tracking-tight">
          {isPlayerOne ? "Player A" : "Player B"}
        </h2>

        <span
          className={`h-5 w-5 rounded-md ${
            isPlayerOne ? "bg-emerald-400" : "bg-blue-500"
          }`}
        />
      </div>

      {/* Balance */}
      <section className="w-full">
        <p className="mb-2 text-sm text-stone-300">Your Balance</p>

        <div className="relative flex h-14 items-center rounded-lg border border-stone-700 bg-black px-4">
          <span className="font-inter text-2xl font-medium tracking-tight">
            {displayedValue}
          </span>

          <AnimatePresence>
            {cashDelta && cashDelta.amount !== 0 && (
              <motion.span
                key={cashDelta.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -10 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`absolute -top-3 right-2 text-sm font-bold ${
                  cashDelta.amount > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {cashDelta.amount > 0 ? "+" : ""}
                {cashDelta.amount.toLocaleString("en-IN")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Bailout Cards */}
      <section className="mt-5 w-full">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-stone-300">Bailout Cards</p>

          <span className="text-xs text-stone-500">
            {player.bailoutsLeft} Left
          </span>
        </div>

        <div className="flex gap-3">
          {[0, 1, 2].map((card) => (
            <div
              key={card}
              className={`h-10 flex-1 rounded-md border ${
                card < player.bailoutsLeft
                  ? isPlayerOne
                    ? "border-emerald-400/70 bg-emerald-400"
                    : "border-blue-500/70 bg-blue-500"
                  : "border-stone-800 bg-stone-900 opacity-40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Startup / Result Cards */}
      <section className="mt-8 w-full">
        <div className="mb-3 grid grid-cols-2 gap-4">
          <p className="text-sm text-stone-200">Card 1</p>
          <p className="text-sm text-stone-200">Card 2</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((slot) => {
            const investment = player.investments[slot];
            return (
              <div
                key={slot}
                className={`flex h-40 flex-col overflow-hidden rounded-lg border-2 ${
                  investment ? "border-stone-800" : "border-transparent bg-[#141414]"
                }`}
              >
                {investment ? (
                  <img
                    src={`/cards/${investment.cardId}.svg`}
                    alt={investment.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="m-auto text-xs text-stone-600">Empty</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Turn / Dice */}
      <section className="mt-6 w-full">
        <p className="mb-3 text-sm text-stone-300">Your Turn</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!isActive}
            onClick={onRoll}
            className={`h-11 flex-1 rounded-lg px-5 text-sm font-semibold transition ${
              isActive
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "cursor-not-allowed bg-yellow-400/30 text-black/50"
            }`}
          >
            Roll Die
          </button>

          <Die3D value={lastRoll} />
        </div>
      </section>

      {/* Result */}
      <section className="mt-7 w-full">
        <p className="mb-3 text-sm text-stone-300">Result</p>

        <div className="space-y-2 text-base text-white">
          {player.investments.length > 0 ? (
            player.investments.map((inv, i) => (
              <div key={i} className="flex items-center gap-2">
                <img
                  src={`/cards/${inv.cardId}.svg`}
                  alt={inv.title}
                  className="h-8 w-6 rounded-sm object-cover"
                />
                <span className="text-sm">
                  {i + 1}. {inv.title}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">No active startups</p>
          )}
        </div>
      </section>
    </aside>
  );
};

export default PlayerPanel;
