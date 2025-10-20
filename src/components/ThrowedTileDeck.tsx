import React from "react";
import { type Tile } from "../utils/gameUtils";

interface ThrowedTileDeckProps {
  tile?: Tile;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * ThrowedTileDeck component - Displays a single discarded tile
 * Shows the tile with proper styling and handles drag functionality
 */
export default function ThrowedTileDeck({
  tile,
  draggable = false,
  onDragStart,
}: ThrowedTileDeckProps) {
  return (
    <>
      {tile && (
        <div
          id={tile.id}
          className={`tile color${tile.joker ? 0 : tile.colorVariant}`}
          draggable={draggable}
          onDragStart={onDragStart}
        >
          <span className="num" id={`num-${1}`}>
            {tile.joker ? "★" : tile.num}
          </span>
          <div className="circle" id={`circle-${1}`}></div>
        </div>
      )}
    </>
  );
}
