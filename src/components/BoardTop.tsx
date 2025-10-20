import ThrowedTileDeck from "./ThrowedTileDeck";

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
        <div className="dropzone">
          <ThrowedTileDeck
            tile={discardedTiles?.p3top4?.[discardedTiles?.p3top4?.length - 1]}
            draggable={false}
          />
        </div>
        <div className={`user ${playing === 3 ? "active" : ""}`}>Ahmet</div>
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
