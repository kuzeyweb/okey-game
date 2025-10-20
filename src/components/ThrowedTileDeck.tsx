import React from "react";
import { type Tile } from "../utils/gameUtils";
import { debugLog } from "../config/debug";

/**
 * ThrowedTileDeck Component
 *
 * Displays a single discarded tile that can be dragged by the human player.
 * Shows the tile number or joker symbol (★) with appropriate color styling.
 *
 * Used throughout the board to show discarded tiles between players.
 */
interface ThrowedTileDeckProps {
  tile?: Tile;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function ThrowedTileDeck({
  tile,
  draggable = false,
  onDragStart,
}: ThrowedTileDeckProps) {
  debugLog("THROWED_TILE_DECK", "Component rendered", {
    tileId: tile?.id,
    tileNumber: tile?.num,
    isJoker: tile?.joker,
    draggable,
    colorVariant: tile?.colorVariant,
  });

  /**
   * Handle drag start event
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    debugLog("THROWED_TILE_DECK", "Drag started", { tileId: tile?.id });
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <>
      {tile && (
        <div
          id={tile.id}
          className={`tile color${tile.joker ? 0 : tile.colorVariant}`}
          draggable={draggable}
          onDragStart={handleDragStart}
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
