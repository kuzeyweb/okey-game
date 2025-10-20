import React from "react";
import ThrowedTileDeck from "./ThrowedTileDeck";
import TileGrid from "./TileGrid";
import { debugLog } from "../config/debug";

/**
 * BoardBottom Component
 *
 * Renders the bottom section of the Okey game board containing:
 * - Player 1 (human player) controls and interface
 * - Discarded tiles from Player 4
 * - Player's own discarded tiles
 * - Sort deck button and player selection
 * - 26-slot tile grid for player's tiles
 *
 * This is the main interactive area for the human player.
 */
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
  debugLog("BOARD_BOTTOM", "Component rendered", {
    playing,
    selectedPlayer,
    playerDecksLength: {
      p1: playerDecks.p1.length,
      p2: playerDecks.p2.length,
      p3: playerDecks.p3.length,
      p4: playerDecks.p4.length,
    },
    discardedTilesCount: {
      p1top2: discardedTiles.p1top2.length,
      p4top1: discardedTiles.p4top1.length,
    },
  });

  /**
   * Handle player selection change
   */
  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlayer = Number(e.target.value);
    debugLog("BOARD_BOTTOM", "Player selection changed", {
      from: selectedPlayer,
      to: newPlayer,
    });
    setSelectedPlayer(newPlayer);
  };

  /**
   * Handle auto sort button click
   */
  const handleAutoSort = () => {
    debugLog("BOARD_BOTTOM", "Auto sort triggered", { selectedPlayer });
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
        {/* Discarded tiles from Player 4 - draggable when player has 14 tiles */}
        <div className="dropzone">
          <ThrowedTileDeck
            tile={discardedTiles?.p4top1?.[discardedTiles?.p4top1?.length - 1]}
            draggable={playing === 1 && playerDecks.p1.length === 14}
            onDragStart={onDrag}
          />
        </div>

        {/* Player 1 controls and interface */}
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

        {/* Player's own discarded tiles - drop zone for discarding */}
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

      {/* 26-slot tile grid for player's tiles */}
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
