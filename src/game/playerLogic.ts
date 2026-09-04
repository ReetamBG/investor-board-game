import { TILES } from "../data/tiles";

export type Player = {
  id: number;
  name: string;
  color: string;
  position: number;
};

export const BOARD_PATH = [
  21, 20, 19, 18, 17, 16, 15, 14,
  13, 12, 11, 10, 9, 8, 7, 6,
  5, 4, 3, 2, 1, 0,
  27, 26, 25, 24, 23, 22,
];

export const START_TILE_INDEX = TILES.findIndex((tile) => tile.category === "Start here →");

export const createPlayers = (): Player[] => {
  const startIndex = START_TILE_INDEX >= 0 ? START_TILE_INDEX : BOARD_PATH[0];

  return [
    { id: 1, name: "Player 1", color: "bg-emerald-400", position: startIndex },
    { id: 2, name: "Player 2", color: "bg-blue-500", position: startIndex },
  ];
};

export const movePlayer = (playerPosition: number, steps: number) => {
  const currentIndex = BOARD_PATH.indexOf(playerPosition);
  const nextIndex = (currentIndex + steps) % BOARD_PATH.length;

  return BOARD_PATH[nextIndex];
};
