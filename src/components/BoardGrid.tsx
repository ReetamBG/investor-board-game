import React from 'react'
import { getGridPosition } from '../utils/gridPosition';
import { TILES } from '../data/tiles';
import Tile from './Tile';
// @ts-ignore
import Player from './Player';

const BoardGrid = ({players}: {players: Player[]}) => {
  return (
      <div className="grid grid-cols-8 grid-rows-8 aspect-square lg:min-w-2xl bg-black border border-stone-800 relative">
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
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 text-white">
              {/* Logo */}
              <div className="flex flex-col items-center text-center">
                <h1 className="mb-0 leading-none">
                  <span className="block font-playfair text-5xl font-medium italic">
                    The
                  </span>
                  <span className="font-inter text-7xl font-semibold">
                    Vault
                  </span>
                </h1>
                <p className="mt-1 text-sm text-stone-200">
                  Crack. Grow. Win.
                </p>
              </div>

              {/* Cards */}
              <div className="mt-10 grid w-full max-w-107.5 grid-cols-3 gap-4">
                {/* Startup Cards */}
                <div className="flex flex-col items-center">
                  <p className="mb-3 text-xs font-medium text-stone-300">
                    Startup Cards
                  </p>
                  <div className="h-48 w-full rounded-lg overflow-hidden border-2 border-stone-800 shadow-lg shadow-black/30">
                    <img
                      src="/cards/startup_card_front.svg"
                      alt="Startup Cards"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Event Cards */}
                <div className="flex flex-col items-center">
                  <p className="mb-3 text-xs font-medium text-stone-300">
                    Event Cards
                  </p>
                  <div className="h-48 w-full rounded-lg overflow-hidden border-2 border-stone-800 shadow-lg shadow-black/30">
                    <img
                      src="/cards/event_card_front.svg"
                      alt="Event Cards"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Result Cards */}
                <div className="flex flex-col items-center">
                  <p className="mb-3 text-xs font-medium text-stone-300">
                    Result Cards
                  </p>
                  <div className="h-48 w-full rounded-lg overflow-hidden border-2 border-stone-800 shadow-lg shadow-black/30">
                    <img
                      src="/cards/result_card_front.svg"
                      alt="Result Cards"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
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

        {players.map((p) => (
          <Player key={p.id} player={p} />
        ))}
      </div>
  )
}

export default BoardGrid