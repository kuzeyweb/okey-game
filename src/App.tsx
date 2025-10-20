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
import { DEBUG_CONFIG, debugLog } from "./config/debug";

/**
 * Main App Component - Okey Game
 *
 * This is the root component that manages the overall game state and renders
 * the complete game board. It orchestrates all game logic through custom hooks
 * and renders the three main board sections.
 *
 * Features:
 * - Game state management (tiles, players, okey, turn order)
 * - Drag and drop functionality
 * - Game flow control (turns, winning conditions)
 * - Board rendering (top, middle, bottom sections)
 */
function App() {
  // Game state initialization
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

  debugLog("APP", "Component rendered", {
    playing,
    gameStatus,
    winningStatus,
    tileDeckLength: tileDeck.length,
  });

  /**
   * Complete turn function - advances to next player
   * Called when a player finishes their turn
   */
  const completeTurn = () => {
    debugLog("APP", "Completing turn", { currentPlayer: playing });
    setPlaying((cr) => {
      const nextPlayer = cr === 4 ? 1 : cr + 1;
      console.info(`${nextPlayer}. Oyuncu oynuyor.`);
      debugLog("APP", "Turn completed", { nextPlayer });
      return nextPlayer;
    });
  };

  // Custom hooks for game functionality
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

  //  Distribute tiles to all players at game start
  const distributeTiles = () => {
    debugLog("APP", "Distributing tiles");
    const { tileDeck: deck, okey: ok, playerDecks } = distributeTilesWithOkey();
    setTileDeck(deck);
    setOkey(ok);
    setPlayerDecks(playerDecks);
    debugLog("APP", "Tiles distributed", {
      remainingTiles: deck.length,
      okeyTile: ok,
    });
  };

  // Effect: Handle winning status - reset game after 15 seconds
  useEffect(() => {
    if (winningStatus) {
      debugLog("APP", "Game won, resetting in 15 seconds");
      setTimeout(() => {
        setWinningStatus(false);
        setDiscardedTiles({ p1top2: [], p2top3: [], p3top4: [], p4top1: [] });
        distributeTiles();
        debugLog("APP", "Game reset completed");
      }, 15000);
    }
  }, [winningStatus]);

  // Effect: Initialize game on first load
  useEffect(() => {
    if (!gameStatus) {
      debugLog("APP", "Initializing game");
      distributeTiles();
      setGameStatus(true);
    }
  }, [tileDeck]);

  // Effect: Handle bot players' turns
  useEffect(() => {
    if (playing !== 1) {
      debugLog("APP", "Bot player turn", { botPlayer: playing });
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
        {/* Top board section - Players 2 and 3 */}
        <BoardTop playing={playing} discardedTiles={discardedTiles} />

        {/* Middle board section - Okey tile and ground tiles */}
        <BoardMiddle
          playing={playing}
          playerDecks={playerDecks}
          tileDeck={tileDeck}
          okey={okey}
          onDrag={onDrag}
          onFinish={onFinish}
          allowDrop={allowDrop}
        />

        {/* Bottom board section - Player 1 controls and tile grid */}
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
