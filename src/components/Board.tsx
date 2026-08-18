import React, { useState } from "react";
import { TILES } from "../data/tiles";
import { createPlayers, movePlayer } from "../game/playerLogic";
import Die from "./Die";
import BoardGrid from "./BoardGrid";

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
    <div className="flex items-start justify-center gap-6 bg-black p-6">
      <BoardGrid players={gamePlayers} />
      <Die
        playerName={gamePlayers[activePlayer].name}
        handleRollDie={handleRollDie}
      />
    </div>
  );
};

export default Board;
