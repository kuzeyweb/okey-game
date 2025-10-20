import React from "react";
import { type Tile } from "../utils/gameUtils";

interface TileGridProps {
  tiles: Tile[];
  slotCount?: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * TileGrid component - Renders the main 26-slot tile grid
 * Displays tiles in their assigned slots and handles drag/drop interactions
 */
export default function TileGrid({
  tiles,
  slotCount = 26,
  onDrop,
  onDragOver,
  onDragStart,
}: TileGridProps) {
  return (
    <div className="tile-container">
      {Array.from({ length: slotCount }).map((_, index) => {
        const tile = tiles.find((t) => t.column === index + 1);
        return (
          <div
            key={index}
            id={`slot-${index + 1}`}
            className="slot"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {tile && (
              <div
                id={`${index + 1}-${tile.id}`}
                className={`tile color${tile.joker ? 0 : tile.colorVariant}`}
                draggable
                onDragStart={onDragStart}
              >
                <span className="num" id={`num-${index + 1}`}>
                  {tile.joker ? "★" : tile.num}
                </span>
                <div className="circle" id={`circle-${index + 1}`}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
