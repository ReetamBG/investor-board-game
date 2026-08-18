import React from "react";
import { Player } from "../game/playerLogic";
import { getGridPosition } from "../utils/gridPosition";

const Player = ({ player }: { player: Player }) => {
  const { gridRow, gridColumn } = getGridPosition(player.position, 8);
  const offsetX = player.id === 1 ? -8 : 8;
  const offsetY = player.id === 1 ? -8 : 8;

  return (
    <div
      key={player.id}
      style={{
        gridRow,
        gridColumn,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }}
      className="z-30 flex items-center justify-center pointer-events-none"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-lg shadow-black/50 ${player.color}`}
      >
        {player.id}
      </div>
    </div>
  );
};

export default Player;
