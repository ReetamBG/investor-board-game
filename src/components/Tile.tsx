import React from "react";

interface Tile {
  id: number;
  svg: string;
  category: string;
  text: string
}

const Tile = ({
  tile,
  gridRow,
  gridColumn,
}: {
  tile: Tile;
  gridRow: number;
  gridColumn: number;
}) => {
  return (
    <div
      key={tile.id}
      style={{ gridRow, gridColumn }}
      className="relative w-full h-full flex flex-col justify-between items-center text-center overflow-hidden"
    >
      {/* Background SVG Tile */}
      <img
        src={tile.svg}
        alt={tile.category}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Tile Content Overlay - not needed anymore as tiles already have content in image */}
      {/* <div className="flex flex-col justify-between h-full w-full pb-4 pt-2 ps-2 pe-2 z-10 pointer-events-none">
        <span className="text-[10px] md:text-xs font-semibold text-white/80 tracking-tighter invisible">
          {tile.category}
        </span>
        <span className="text-[10px] md:text-[12px] font-bold text-black leading-tight invisible">
          {tile.text}
        </span>
      </div> */}
    </div>
  );
};

export default Tile;
