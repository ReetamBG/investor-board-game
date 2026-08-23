import React from "react";
import { formatCash, type GamePlayer } from "../game/gameLogic";
import Die3D from "./Die3D";

type PlayerPanelProps = {
  player: GamePlayer;
  isActive: boolean;
  lastRoll: number | null;
  onRoll: () => void;
};

const PlayerPanel = ({
  player,
  isActive,
  lastRoll,
  onRoll,
}: PlayerPanelProps) => {
  const isPlayerOne = player.id === 1;

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

        <div className="flex h-14 items-center rounded-lg border border-stone-700 bg-black px-4">
          <span className="font-inter text-2xl font-medium tracking-tight">
            {formatCash(player.cash)}
          </span>
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
                className={`flex h-40 flex-col justify-between rounded-lg p-3 ${
                  investment ? "bg-[#202020]" : "bg-[#141414]"
                }`}
              >
                {investment ? (
                  <>
                    <p className="text-sm font-semibold leading-tight">
                      {investment.title}
                    </p>
                    <p className="text-sm text-stone-300">
                      {formatCash(investment.amount)}
                    </p>
                  </>
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
              <p key={i}>
                {i + 1}. {inv.title} ({formatCash(inv.amount)})
              </p>
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
