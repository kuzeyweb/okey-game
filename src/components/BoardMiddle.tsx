import React from "react";
import { debugLog } from "../utils/debug";

interface BoardMiddleProps {
  playing: number;
  playerDecks: { p1: any[]; p2: any[]; p3: any[]; p4: any[] };
  tileDeck: any[];
  okey: any;
  onDrag: (e: React.DragEvent) => void;
  onFinish: () => void;
  allowDrop: (e: React.DragEvent) => void;
}

/**
 * BoardMiddle component - Middle section of the game board
 * Contains the okey tile, ground tiles, and side players
 */
export default function BoardMiddle({
  playing,
  playerDecks,
  tileDeck,
  okey,
  onDrag,
  onFinish,
  allowDrop,
}: BoardMiddleProps) {
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
        {/* Okey tile display */}
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

        {/* Ground tiles counter */}
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
