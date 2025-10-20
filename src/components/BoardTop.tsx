import ThrowedTileDeck from "./ThrowedTileDeck";
import { debugLog } from "../utils/debug";

interface BoardTopProps {
  playing: number;
  discardedTiles: {
    p1top2: any[];
    p2top3: any[];
    p3top4: any[];
    p4top1: any[];
  };
}

/**
 * BoardTop component - Top section of the game board
 * Displays player 3 and player 2 areas with their discarded tiles
 */
export default function BoardTop({ playing, discardedTiles }: BoardTopProps) {
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
        {/* Player 3 area */}
        <div className="dropzone">
          <ThrowedTileDeck
            tile={discardedTiles?.p3top4?.[discardedTiles?.p3top4?.length - 1]}
            draggable={false}
          />
        </div>
        <div className={`user ${playing === 3 ? "active" : ""}`}>Ahmet</div>

        {/* Player 2 area */}
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
