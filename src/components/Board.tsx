import React from "react";
import { TILES } from "../data/tiles";
import { getGridPosition } from "../utils/gridPosition";
import Tile from "./Tile";

const Board = () => {
  return (
    <div className="flex justify-center items-center bg-black p-6">
      <div className="grid grid-cols-8 grid-rows-8 aspect-square min-w-3xl max-w-4xl bg-black border border-stone-800 relative">
        {/* Center Area Container */}
        <div className="col-start-2 col-span-6 row-start-2 row-span-6 p-6">
          {/* Inner Wrapper (relative so absolute image stays inside padding) */}
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xs select-none">
            {/* Background Image */}
            <img
              src="/checkerboard-pattern.svg"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover z-0 brightness-200"
            />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 text-white">
              <h1 className="mb-0 leading-none">
                <span className="text-5xl font-playfair italic block font-medium">
                  The
                </span>
                <span className="font-inter text-8xl">Vault</span>
              </h1>
              <p className="text-stone-200 text-sm ">
                Crack. Grow. Win.
              </p>
            </div>
          </div>
        </div>

        {/* Perimeter Tiles (Must remain inside the grid container) */}
        {TILES.map((tile, i) => {
          const { gridRow, gridColumn } = getGridPosition(i, 8);
          return (
            <Tile
              key={tile.id}
              tile={tile}
              gridRow={gridRow}
              gridColumn={gridColumn}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Board;
