import ThrowedTileDeck from "./ThrowedTileDeck";
import { debugLog } from "../config/debug";

/**
 * BoardTop Component
 *
 * Renders the top section of the Okey game board containing:
 * - Player 3  area with discarded tiles from Player 2
 * - Player 2 area with discarded tiles from Player 3
 *
 * This component displays the discarded tiles between players
 * and shows which player is currently active.
 */
interface BoardTopProps {
  playing: number;
  discardedTiles: {
    p1top2: any[];
    p2top3: any[];
    p3top4: any[];
    p4top1: any[];
  };
}

export default function BoardTop({ playing, discardedTiles }: BoardTopProps) {
  debugLog("BOARD_TOP", "Component rendered", {
    playing,
    discardedTilesCount: {
      p2top3: discardedTiles.p2top3.length,
      p3top4: discardedTiles.p3top4.length,
    },
  });

  return (
    <div className="board-top">
      <div className="cue-vertical"></div>
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
        {/* Player 3 area with tiles from Player 2 */}
        <div className="dropzone">
          <ThrowedTileDeck
            tile={discardedTiles?.p3top4?.[discardedTiles?.p3top4?.length - 1]}
            draggable={false}
          />
        </div>
        <div className={`user ${playing === 3 ? "active" : ""}`}>Ahmet</div>

        {/* Player 2 area with tiles from Player 3 */}
        <div className="dropzone">
          <ThrowedTileDeck
            tile={discardedTiles?.p2top3?.[discardedTiles?.p2top3?.length - 1]}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
