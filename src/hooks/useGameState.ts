import { useCallback } from "react";
import { groupConsecutiveColumns } from "../utils/gameUtils";
import {
  groupDeckWithOkey,
  improvesPointWith,
  isWinningDeck,
} from "../utils/gameLogic";

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
  onAiWin?: (winner: number) => void;
}

/**
 * useGameState hook - Manages core game state and flow
 * Handles turn management, auto-sorting, AI actions, and win conditions
 */
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
  onAiWin,
}: UseGameStateProps) {
  /**
   * Completes the current turn and moves to the next player
   */
  const completeTurn = useCallback(() => {
    setPlaying((cr) => (cr === 4 ? 1 : cr + 1));
  }, [setPlaying]);

  const onAutoSort = useCallback(
    (deckOwner?: 1 | 2 | 3 | 4) => {
      const result = groupDeckWithOkey(
        playerDecks[`p${deckOwner ?? (1 as 1)}`],
        okey
      );
      setPlayerDecks((cr) => ({
        ...cr,
        [`p${deckOwner ?? 1}`]: result,
      }));
    },
    [playerDecks, okey, setPlayerDecks]
  );

  const play = useCallback(() => {
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
      if (
        improvesPointWith(
          playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`],
          thrownTile,
          okey,
          currentPoint
        )
      ) {
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
          if (onAiWin && playing !== 1) onAiWin(playing);
        } else {
          botDiscard(
            deckWithThrownTile.find(
              (item) =>
                item.column ===
                [...deckWithThrownTile].sort((a, b) => b.column - a.column)?.[0]
                  .column
            ),
            playing,
            deckWithThrownTile
          );
        }
      } else {
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
          if (onAiWin && playing !== 1) onAiWin(playing);
        } else {
          botDiscard(
            updatedDeck.find(
              (item) =>
                item.column ===
                [...updatedDeck].sort((a, b) => b.column - a.column)?.[0].column
            ),
            playing,
            updatedDeck
          );
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

  const botDiscard = useCallback(
    (tile: any, player: number, deck: any) => {
      const throwedPlayer =
        player === 4 ? "p4top1" : `p${player}top${player + 1}`;
      const discardedTile = deck?.find((item: any) => item.id === tile?.id);
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

  const onFinish = useCallback(() => {
    if (isWinningDeck(playerDecks.p1, okey)) setWinningStatus(true);
  }, [playerDecks, okey, setWinningStatus]);

  return { completeTurn, onAutoSort, play, botDiscard, onFinish };
}
