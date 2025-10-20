import { useEffect, useState } from "react";
import "./App.css";
import AutoUnmuteYouTube from "./components/media/YTVideoPlayer";
import BoardTop from "./components/board/BoardTop";
import BoardMiddle from "./components/board/BoardMiddle";
import BoardBottom from "./components/board/BoardBottom";
import { allTiles } from "./utils/gameUtils";
import { distributeTilesWithOkey } from "./utils/gameLogic";
import { useDragDrop } from "./hooks/useDragDrop";
import { useGameState } from "./hooks/useGameState";
import { debugLog } from "./utils/debug";

/**
 * Main App component for the Okey game
 * Manages game state, player turns, and renders the game board
 */
function App() {
  // Game state management
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

  /**
   * Completes the current turn and moves to the next player
   */
  const completeTurn = () => {
    setPlaying((cr) => {
      const nextPlayer = cr === 4 ? 1 : cr + 1;
      console.info(`${nextPlayer}. Oyuncu oynuyor.`);
      debugLog("STATE_CHANGES", `Turn completed, next player: ${nextPlayer}`);
      return nextPlayer;
    });
  };

  // Drag and drop functionality hook
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

  // Game state management hook
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

  /**
   * Distributes tiles to all players and sets up the game
   */
  const distributeTiles = () => {
    const { tileDeck: deck, okey: ok, playerDecks } = distributeTilesWithOkey();
    setTileDeck(deck);
    setOkey(ok);
    setPlayerDecks(playerDecks);
    debugLog("STATE_CHANGES", "Tiles distributed to all players");
  };

  // Effect: Handle winning status and restart game
  useEffect(() => {
    if (winningStatus) {
      debugLog("GAME_EVENTS", "Game won, restarting in 15 seconds");
      setTimeout(() => {
        setWinningStatus(false);
        setDiscardedTiles({ p1top2: [], p2top3: [], p3top4: [], p4top1: [] });
        distributeTiles();
      }, 15000);
    }
  }, [winningStatus]);

  // Effect: Initialize game on first load
  useEffect(() => {
    if (!gameStatus) {
      distributeTiles();
      setGameStatus(true);
    }
  }, [tileDeck]);

  // Effect: Handle AI player turns
  useEffect(() => {
    if (playing !== 1) {
      debugLog("GAME_EVENTS", `AI player ${playing} turn`);
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
