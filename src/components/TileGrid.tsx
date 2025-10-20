import React from "react";
import { type Tile } from "../utils/gameUtils";
import { debugLog } from "../config/debug";

/**
 * TileGrid Component
 *
 * Renders a grid of slots (default 26) where player tiles can be placed.
 * Each slot can contain a tile that can be dragged and dropped.
 *
 * Used in the bottom board section to display the human player's tiles.
 * Supports drag and drop operations for tile rearrangement.
 */
interface TileGridProps {
  tiles: Tile[];
  slotCount?: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function TileGrid({
  tiles,
  slotCount = 26,
  onDrop,
  onDragOver,
  onDragStart,
}: TileGridProps) {
  debugLog("TILE_GRID", "Component rendered", {
    slotCount,
    tilesCount: tiles.length,
    tilesWithColumns: tiles.filter((t) => t.column).length,
  });

  /**
   * Handle drop event on a slot
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    debugLog("TILE_GRID", "Drop event", {
      targetSlot: e.currentTarget.id,
      dataTransfer: e.dataTransfer.getData("text"),
    });
    onDrop(e);
  };

  /**
   * Handle drag over event on a slot
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    onDragOver(e);
  };

  /**
   * Handle drag start event on a tile
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    debugLog("TILE_GRID", "Drag start", {
      tileId: e.currentTarget.id,
      tileElement: e.currentTarget,
    });
    onDragStart(e);
  };

  return (
    <div className="tile-container">
      {Array.from({ length: slotCount }).map((_, index) => {
        const tile = tiles.find((t) => t.column === index + 1);

        debugLog("TILE_GRID", "Rendering slot", {
          slotIndex: index + 1,
          hasTile: !!tile,
          tileId: tile?.id,
        });

        return (
          <div
            key={index}
            id={`slot-${index + 1}`}
            className="slot"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {tile && (
              <div
                id={`${index + 1}-${tile.id}`}
                className={`tile color${tile.joker ? 0 : tile.colorVariant}`}
                draggable
                onDragStart={handleDragStart}
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
