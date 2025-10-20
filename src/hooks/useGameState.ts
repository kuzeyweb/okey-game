import { useCallback } from "react";
import { groupConsecutiveColumns } from "../utils/gameUtils";
import {
  groupDeckWithOkey,
  improvesPointWith,
  isWinningDeck,
} from "../utils/gameLogic";
import { debugLog } from "../config/debug";

/**
 * useGameState Hook
 *
 * Custom hook that manages the core game state and flow including:
 * - Turn management and completion
 * - Auto-sorting functionality
 * - Bot player AI logic
 * - Win condition checking
 * - Game flow control
 *
 * This hook encapsulates all the complex game logic that determines
 * how the game progresses and how AI players make decisions.
 */
type PlayerDecks = { p1: any[]; p2: any[]; p3: any[]; p4: any[] };
type DiscardedTiles = {
  p1top2: any[];
  p2top3: any[];
  p3top4: any[];
  p4top1: any[];
};

interface UseGameStateProps {
  playerDecks: PlayerDecks;
  setPlayerDecks: React.Dispatch<React.SetStateAction<PlayerDecks>>;
  tileDeck: any[];
  setTileDeck: React.Dispatch<React.SetStateAction<any[]>>;
  discardedTiles: DiscardedTiles;
  setDiscardedTiles: React.Dispatch<React.SetStateAction<DiscardedTiles>>;
  okey: any;
  playing: number;
  setPlaying: React.Dispatch<React.SetStateAction<number>>;
  setWinningStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useGameState({
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
}: UseGameStateProps) {
  /**
   * Complete turn - advance to next player
   */
  const completeTurn = useCallback(() => {
    debugLog("USE_GAME_STATE", "Completing turn", { currentPlayer: playing });
    setPlaying((cr) => {
      const nextPlayer = cr === 4 ? 1 : cr + 1;
      debugLog("USE_GAME_STATE", "Turn completed", { nextPlayer });
      return nextPlayer;
    });
  }, [setPlaying, playing]);

  /**
   * Auto-sort player's deck
   */
  const onAutoSort = useCallback(
    (deckOwner?: 1 | 2 | 3 | 4) => {
      const player = deckOwner ?? 1;
      debugLog("USE_GAME_STATE", "Auto sorting deck", {
        player,
        deckLength: playerDecks[`p${player}`].length,
      });

      const result = groupDeckWithOkey(playerDecks[`p${player}`], okey);
      debugLog("USE_GAME_STATE", "Deck sorted", {
        player,
        originalLength: playerDecks[`p${player}`].length,
        sortedLength: result.length,
      });

      setPlayerDecks((cr) => ({
        ...cr,
        [`p${player}`]: result,
      }));
    },
    [playerDecks, okey, setPlayerDecks]
  );

  /**
   * Bot player AI logic
   */
  const play = useCallback(() => {
    debugLog("USE_GAME_STATE", "Bot player turn started", {
      botPlayer: playing,
    });

    const groupedDeck = groupDeckWithOkey(
      playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`],
      okey
    );
    const consecutiveCols = groupConsecutiveColumns(groupedDeck);
    let currentPoint = 0;
    consecutiveCols.forEach((item, index) =>
      item.length > 2 && index !== consecutiveCols.length - 1
        ? (currentPoint += item.length)
        : null
    );

    debugLog("USE_GAME_STATE", "Bot analysis", {
      botPlayer: playing,
      currentPoint,
      consecutiveGroups: consecutiveCols.length,
      groupedDeckLength: groupedDeck.length,
    });

    const checkCases = () => {
      const throwedPlayer =
        playing === 1 ? "p4top1" : `p${playing - 1}top${playing}`;
      const thrownTile =
        discardedTiles[throwedPlayer as keyof DiscardedTiles][
          discardedTiles[throwedPlayer as keyof DiscardedTiles].length - 1
        ];
      const deckWithThrownTile = groupDeckWithOkey(
        [...playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`], thrownTile],
        okey
      );

      debugLog("USE_GAME_STATE", "Bot evaluating thrown tile", {
        botPlayer: playing,
        thrownTile: thrownTile?.id,
        throwedPlayer,
        improvesPoint: improvesPointWith(
          playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`],
          thrownTile,
          okey,
          currentPoint
        ),
      });

      if (
        improvesPointWith(
          playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`],
          thrownTile,
          okey,
          currentPoint
        )
      ) {
        debugLog("USE_GAME_STATE", "Bot taking thrown tile", {
          botPlayer: playing,
          thrownTile: thrownTile?.id,
        });

        setDiscardedTiles((cr: any) => ({
          ...cr,
          [throwedPlayer]: cr[throwedPlayer as keyof DiscardedTiles].filter(
            (item: any) => item.id !== thrownTile.id
          ),
        }));
        setPlayerDecks((cr) => ({
          ...cr,
          [`p${playing}`]: deckWithThrownTile,
        }));

        if (isWinningDeck(deckWithThrownTile, okey)) {
          debugLog("USE_GAME_STATE", "Bot won with thrown tile!", {
            botPlayer: playing,
          });
          // winner
        } else {
          const tileToDiscard = deckWithThrownTile.find(
            (item) =>
              item.column ===
              [...deckWithThrownTile].sort(
                (a, b) => (b.column || 0) - (a.column || 0)
              )?.[0].column
          );
          debugLog("USE_GAME_STATE", "Bot discarding tile", {
            botPlayer: playing,
            discardedTile: tileToDiscard?.id,
          });
          botDiscard(tileToDiscard, playing, deckWithThrownTile);
        }
      } else {
        debugLog("USE_GAME_STATE", "Bot taking from ground", {
          botPlayer: playing,
          groundTilesLeft: tileDeck.length,
        });

        if (tileDeck.length < 1) return;
        const pulledTile = tileDeck[0];
        setTileDeck((cr) =>
          [...cr].filter((item) => item.id !== pulledTile.id)
        );
        const updatedDeck = groupDeckWithOkey(
          [...playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`], pulledTile],
          okey
        );
        setPlayerDecks((cr) => ({
          ...cr,
          [`p${playing}`]: updatedDeck,
        }));

        if (isWinningDeck(updatedDeck, okey)) {
          debugLog("USE_GAME_STATE", "Bot won with ground tile!", {
            botPlayer: playing,
          });
          // winner
        } else {
          const tileToDiscard = updatedDeck.find(
            (item) =>
              item.column ===
              [...updatedDeck].sort(
                (a, b) => (b.column || 0) - (a.column || 0)
              )?.[0].column
          );
          debugLog("USE_GAME_STATE", "Bot discarding ground tile", {
            botPlayer: playing,
            discardedTile: tileToDiscard?.id,
          });
          botDiscard(tileToDiscard, playing, updatedDeck);
        }
      }
    };
    setTimeout(checkCases, 500);
  }, [
    playerDecks,
    discardedTiles,
    tileDeck,
    setTileDeck,
    setPlayerDecks,
    setDiscardedTiles,
    okey,
    playing,
  ]);

  /**
   * Bot discard logic
   */
  const botDiscard = useCallback(
    (tile: any, player: number, deck: any) => {
      const throwedPlayer =
        player === 4 ? "p4top1" : `p${player}top${player + 1}`;
      const discardedTile = deck?.find((item: any) => item.id === tile?.id);

      debugLog("USE_GAME_STATE", "Bot discarding tile", {
        botPlayer: player,
        discardedTile: discardedTile?.id,
        throwedPlayer,
      });

      setPlayerDecks((cr) => ({
        ...cr,
        [`p${playing}`]: deck.filter((item: any) => item.id !== tile.id),
      }));
      setDiscardedTiles((current: any) => ({
        ...current,
        [throwedPlayer]: [
          ...current[throwedPlayer as keyof DiscardedTiles],
          discardedTile,
        ],
      }));
      completeTurn();
    },
    [setPlayerDecks, setDiscardedTiles, playing, completeTurn]
  );

  /**
   * Check win condition for human player
   */
  const onFinish = useCallback(() => {
    debugLog("USE_GAME_STATE", "Checking win condition", {
      playerDeckLength: playerDecks.p1.length,
      isWinning: isWinningDeck(playerDecks.p1, okey),
    });

    if (isWinningDeck(playerDecks.p1, okey)) {
      debugLog("USE_GAME_STATE", "Player 1 won!", {
        playerDeck: playerDecks.p1,
      });
      setWinningStatus(true);
    }
  }, [playerDecks, okey, setWinningStatus]);

  return { completeTurn, onAutoSort, play, botDiscard, onFinish };
}
