import React from "react";

const Die = ({playerName, handleRollDie}: {
    playerName: string;
    handleRollDie: () => void;
}) => {
  return (
    <div className="flex w-52 flex-col gap-4 rounded-xl border border-stone-800 bg-stone-950/80 p-4 text-white shadow-lg shadow-black/30">
      <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
        Turn
      </div>
      <div className="text-lg font-semibold">
        {playerName}
      </div>
      <button
        type="button"
        onClick={handleRollDie}
        className="rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:bg-amber-300"
      >
        Roll Die
      </button>
    </div>
  );
};

export default Die;
