import React from "react";
import { debugLog } from "../config/debug";

/**
 * BoardMiddle Component
 *
 * Renders the middle section of the Okey game board containing:
 * - Left side: Player 4 area
 * - Center: Okey tile (shows the current okey number) and ground tiles count
 * - Right side: Player 2 area
 *
 * The okey tile displays the number that acts as a wildcard/joker.
 * The ground tiles show how many tiles are left in the deck.
 */
interface BoardMiddleProps {
  playing: number;
  playerDecks: { p1: any[]; p2: any[]; p3: any[]; p4: any[] };
  tileDeck: any[];
  okey: any;
  onDrag: (e: React.DragEvent) => void;
  onFinish: () => void;
  allowDrop: (e: React.DragEvent) => void;
}

export default function BoardMiddle({
  playing,
  playerDecks,
  tileDeck,
  okey,
  onDrag,
  onFinish,
  allowDrop,
}: BoardMiddleProps) {
  debugLog("BOARD_MIDDLE", "Component rendered", {
    playing,
    okeyTile: okey,
    groundTilesCount: tileDeck.length,
    playerDecksLength: {
      p1: playerDecks.p1.length,
      p2: playerDecks.p2.length,
      p3: playerDecks.p3.length,
      p4: playerDecks.p4.length,
    },
  });

  return (
    <div className="mid-section">
      {/* Left side - Player 4 */}
      <div className="board-left">
        <div className="cue-horizontal"></div>
        <div className="user-area">
          <div className={`user ${playing === 4 ? "active" : ""}`}>Aybek</div>
        </div>
      </div>

      {/* Center - Okey tile and ground tiles */}
      <div className="board-middle">
        {/* Okey tile - shows the wildcard number */}
        <div
          className={`tile color${okey?.colorVariant}`}
          style={{ width: "54px", height: "82px" }}
          onDrop={onFinish}
          onDragOver={allowDrop}
        >
          <span className="num">
            {okey?.num ? (okey.num !== 1 ? okey.num - 1 : 13) : ""}
          </span>
          <div className="circle"></div>
        </div>

        {/* Ground tiles count - draggable when player has 14 tiles */}
        <div className={`tile`} style={{ width: "54px", height: "82px" }}>
          <div
            className="num"
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
            draggable={playing === 1 && playerDecks.p1.length === 14}
            onDragStart={onDrag}
          >
            {tileDeck?.length}
          </div>
        </div>
      </div>

      {/* Right side - Player 2 */}
      <div className="board-right">
        <div className="user-area" style={{ alignItems: "end" }}>
          <div className={`user ${playing === 2 ? "active" : ""}`}>Tan</div>
        </div>
        <div className="cue-horizontal"></div>
      </div>
    </div>
  );
}
