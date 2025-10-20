import { useEffect, useState } from "react";
import "./App.css";
import AutoUnmuteYouTube from "./components/YTVideoPlayer";
import BoardTop from "./components/BoardTop";
import BoardMiddle from "./components/BoardMiddle";
import BoardBottom from "./components/BoardBottom";
import { allTiles } from "./utils/gameUtils";
import { distributeTilesWithOkey } from "./utils/gameLogic";
import { useDragDrop } from "./hooks/useDragDrop";
import { useGameState } from "./hooks/useGameState";

function App() {
  const [tileDeck, setTileDeck] = useState(allTiles);
  const [playerDecks, setPlayerDecks] = useState<{
    p1: any[];
    p2: any[];
    p3: any[];
    p4: any[];
  }>({ p1: [], p2: [], p3: [], p4: [] });
  const [okey, setOkey] = useState<any>();
  const [playing, setPlaying] = useState<number>(1);
  const [winningStatus, setWinningStatus] = useState(false);
  const [gameStatus, setGameStatus] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(1);
  const [discardedTiles, setDiscardedTiles] = useState<any>({
    p1top2: [],
    p2top3: [],
    p3top4: [],
    p4top1: [],
  });

  const completeTurn = () => {
    setPlaying((cr) => {
      console.info(`${cr === 4 ? 1 : cr + 1}. Oyuncu oynuyor.`);
      return cr === 4 ? 1 : cr + 1;
    });
  };

  const { allowDrop, onDrag, onDrop, discardTile } = useDragDrop({
    playerDecks,
    setPlayerDecks,
    discardedTiles,
    setDiscardedTiles,
    tileDeck,
    setTileDeck,
    playing,
    completeTurn,
  });

  const { onAutoSort, play, onFinish } = useGameState({
    playerDecks,
    setPlayerDecks,
    tileDeck,
    setTileDeck,
    discardedTiles,
    setDiscardedTiles,
    okey,
    playing,
    setPlaying,
    setWinningStatus,
  });

  const distributeTiles = () => {
    const { tileDeck: deck, okey: ok, playerDecks } = distributeTilesWithOkey();
    setTileDeck(deck);
    setOkey(ok);
    setPlayerDecks(playerDecks);
  };

  useEffect(() => {
    if (winningStatus)
      setTimeout(() => {
        setWinningStatus(false);
        setDiscardedTiles({ p1top2: [], p2top3: [], p3top4: [], p4top1: [] });
        distributeTiles();
      }, 15000);
  }, [winningStatus]);

  useEffect(() => {
    if (!gameStatus) {
      distributeTiles();
      setGameStatus(true);
    }
  }, [tileDeck]);

  useEffect(() => {
    if (playing !== 1) {
      play();
    }
  }, [playing]);

  return (
    <>
      <h1 className="logo" style={{ margin: 0 }}>
        Okey
      </h1>
      {winningStatus && <AutoUnmuteYouTube />}
      <div className="canvas">
        <BoardTop playing={playing} discardedTiles={discardedTiles} />
        <BoardMiddle
          playing={playing}
          playerDecks={playerDecks}
          tileDeck={tileDeck}
          okey={okey}
          onDrag={onDrag}
          onFinish={onFinish}
          allowDrop={allowDrop}
        />
        <BoardBottom
          playing={playing}
          playerDecks={playerDecks}
          discardedTiles={discardedTiles}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          onAutoSort={onAutoSort}
          onDrag={onDrag}
          onDrop={onDrop}
          allowDrop={allowDrop}
          discardTile={discardTile}
        />
      </div>
    </>
  );
}

export default App;
