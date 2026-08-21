import React, { useState } from "react";
import { TILES } from "../data/tiles";
import { createPlayers, movePlayer } from "../game/playerLogic";
import BoardGrid from "./BoardGrid";
import PlayerPanel from "./PlayerPanel";

const Board = () => {
  const [gamePlayers, setGamePlayers] = useState(createPlayers);
  const [activePlayer, setActivePlayer] = useState(0);

  const handleRollDie = () => {
    const dieRoll = Math.floor(Math.random() * 6) + 1;
    const currentPlayer = gamePlayers[activePlayer];
    const nextPosition = movePlayer(currentPlayer.position, dieRoll);
    const landedTile = TILES[nextPosition];

    setGamePlayers((prevPlayers) =>
      prevPlayers.map((player, index) =>
        index === activePlayer ? { ...player, position: nextPosition } : player,
      ),
    );

    window.alert(`${currentPlayer.name} rolled ${dieRoll}. ${landedTile.text}`);
    setActivePlayer((prev) => (prev + 1) % gamePlayers.length);
  };

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center gap-8 px-6 py-8">
        {/* Player A */}
        <PlayerPanel
          player={gamePlayers[0]}
          isActive={activePlayer === 0}
          onRoll={handleRollDie}
        />

        {/* Center Board */}
        <div className="flex shrink-0 items-center justify-center">
          <BoardGrid players={gamePlayers} />
        </div>

        {/* Player B */}
        <PlayerPanel
          player={gamePlayers[1]}
          isActive={activePlayer === 1}
          onRoll={handleRollDie}
        />
      </div>
    </main>
  );
};

export default Board;
