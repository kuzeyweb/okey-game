import React from "react";
import ThrowedTileDeck from "./ThrowedTileDeck";
import TileGrid from "./TileGrid";
import { debugLog } from "../utils/debug";

interface BoardBottomProps {
  playing: number;
  playerDecks: { p1: any[]; p2: any[]; p3: any[]; p4: any[] };
  discardedTiles: {
    p1top2: any[];
    p2top3: any[];
    p3top4: any[];
    p4top1: any[];
  };
  selectedPlayer: number;
  setSelectedPlayer: (player: number) => void;
  onAutoSort: (player?: 1 | 2 | 3 | 4) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  allowDrop: (e: React.DragEvent) => void;
  discardTile: (e: React.DragEvent) => void;
}

/**
 * BoardBottom component - Bottom section of the game board
 * Contains player 1 area, controls, discard zone, and the main tile grid
 */
export default function BoardBottom({
  playing,
  playerDecks,
  discardedTiles,
  selectedPlayer,
  setSelectedPlayer,
  onAutoSort,
  onDrag,
  onDrop,
  allowDrop,
  discardTile,
}: BoardBottomProps) {
  debugLog("FUNCTION_CALLS", "BoardBottom render");

  /**
   * Handles player selection change
   */
  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlayer = Number(e.target.value);
    debugLog("STATE_CHANGES", `Selected player changed to: ${newPlayer}`);
    setSelectedPlayer(newPlayer);
  };

  /**
   * Handles auto sort button click
   */
  const handleAutoSort = () => {
    debugLog("FUNCTION_CALLS", "Auto sort button clicked");
    onAutoSort();
  };
  return (
    <div className="board-bottom">
      <div
        className="user-area"
        style={{
          height: "unset",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-around",
        }}
      >
        {/* Player 4's discarded tiles (draggable by player 1) */}
        <div className="dropzone">
          <ThrowedTileDeck
            tile={discardedTiles?.p4top1?.[discardedTiles?.p4top1?.length - 1]}
            draggable={playing === 1 && playerDecks.p1.length === 14}
            onDragStart={onDrag}
          />
        </div>
        {/* Player 1 controls area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div className={`user ${playing === 1 ? "active" : ""}`}>Oyuncu</div>
          <div>
            <button onClick={handleAutoSort}>Sort Deck</button>
            <select
              onChange={handlePlayerChange}
              value={selectedPlayer}
              name="player"
              id=""
            >
              <option value="1">Player 1</option>
              <option value="2">Player 2</option>
              <option value="3">Player 3</option>
              <option value="4">Player 4</option>
            </select>
          </div>
        </div>
        {/* Discard zone for player 1 */}
        <div
          className="dropzone"
          style={{ marginBottom: "-200px" }}
          onDrop={discardTile}
          onDragOver={
            playing === 1 && playerDecks?.p1?.length === 15
              ? allowDrop
              : undefined
          }
        >
          {discardedTiles.p1top2.length > 0 && (
            <div
              id={discardedTiles.p1top2[discardedTiles.p1top2.length - 1]?.id}
              className={`tile color${
                discardedTiles.p1top2[discardedTiles.p1top2.length - 1]
                  ?.colorVariant
              }`}
            >
              <span className="num" id={`num-${1}`}>
                {discardedTiles.p1top2[discardedTiles.p1top2.length - 1].joker
                  ? "★"
                  : discardedTiles.p1top2[discardedTiles.p1top2.length - 1]
                      ?.num}
              </span>
              <div className="circle" id={`circle-${1}`}></div>
            </div>
          )}
        </div>
      </div>
      {/* Main tile grid for selected player */}
      <div className="board-container">
        <TileGrid
          tiles={playerDecks?.[`p${selectedPlayer as 1 | 2 | 3 | 4}`] ?? []}
          slotCount={26}
          onDrop={onDrop}
          onDragOver={allowDrop}
          onDragStart={onDrag}
        />
      </div>
    </div>
  );
}
