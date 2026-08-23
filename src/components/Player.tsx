import React from "react";
import type { Player } from "../game/playerLogic";
import { getGridPosition } from "../utils/gridPosition";

export const PLAYER_MOVE_MS = 500;

const Player = ({ player }: { player: Player }) => {
  const { gridRow, gridColumn } = getGridPosition(player.position, 8);
  const offsetX = player.id === 1 ? -8 : 8;
  const offsetY = player.id === 1 ? -8 : 8;

  return (
    <div
      className="pointer-events-none absolute z-30 flex items-center justify-center"
      style={{
        width: "12.5%",
        height: "12.5%",
        left: `${(gridColumn - 1) * 12.5}%`,
        top: `${(gridRow - 1) * 12.5}%`,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: `left ${PLAYER_MOVE_MS}ms ease-in-out, top ${PLAYER_MOVE_MS}ms ease-in-out`,
      }}
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
