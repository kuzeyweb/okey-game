import { useCallback } from "react";
import { debugLog } from "../utils/debug";

export type PlayerDecks = { p1: any[]; p2: any[]; p3: any[]; p4: any[] };
export type DiscardedTiles = {
  p1top2: any[];
  p2top3: any[];
  p3top4: any[];
  p4top1: any[];
};

interface UseDragDropProps {
  playerDecks: PlayerDecks;
  setPlayerDecks: React.Dispatch<React.SetStateAction<PlayerDecks>>;
  discardedTiles: DiscardedTiles;
  setDiscardedTiles: React.Dispatch<React.SetStateAction<DiscardedTiles>>;
  tileDeck: any[];
  setTileDeck: React.Dispatch<React.SetStateAction<any[]>>;
  playing: number;
  completeTurn: () => void;
}

/**
 * useDragDrop hook - Manages all drag and drop functionality
 * Handles tile movement between slots, ground tiles, and discarded tiles
 */
export function useDragDrop({
  playerDecks,
  setPlayerDecks,
  discardedTiles,
  setDiscardedTiles,
  tileDeck,
  setTileDeck,
  playing,
  completeTurn,
}: UseDragDropProps) {
  /**
   * Allows drop events to occur
   */
  const allowDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Handles drag start events
   */
  const onDrag = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text", e.currentTarget.id);
  }, []);

  /**
   * Handles drop events for tile movement
   */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("text");
      const currentSlot = Number(data.split("-")[0]);
      const targetSlot = Number(e.currentTarget.id.split("-").pop());

      if (!targetSlot) return;

      if (!currentSlot) {
        // Dragging from discarded tiles or ground
        const draggedTile = discardedTiles?.p4top1?.find(
          (item: any) => item.id === data
        );

        if (!draggedTile) {
          // Dragging from ground
          if (tileDeck.length < 1) {
            return window.alert("Yerde taş kalmadı, oyun bitti.");
          }
          if (playerDecks.p1.length === 15) return;

          const pulledTile = tileDeck[0];
          setTileDeck((cr) =>
            [...cr].filter((item) => item.id !== pulledTile.id)
          );
          setPlayerDecks((cr) => {
            let target = targetSlot;
            while (cr.p1.find((item) => item.column === target)) {
              target++;
            }
            return {
              ...cr,
              p1: [...cr.p1, { ...pulledTile, column: target }],
            };
          });
          return;
        }

        // Dragging from discarded tiles
        setDiscardedTiles((cr: any) => ({
          ...cr,
          p4top1: [...cr.p4top1].filter((item) => item.id !== draggedTile.id),
        }));
        setPlayerDecks((cr) => {
          let target = targetSlot;
          while (cr.p1.find((item) => item.column === target)) {
            target++;
          }
          return {
            ...cr,
            p1: [...cr.p1, { ...draggedTile, column: target }],
          };
        });
        return;
      }

      // Dragging between player slots
      const draggedTile = playerDecks?.p1?.find(
        (item) => item.column === currentSlot
      );
      const targetTile = playerDecks?.p1?.find(
        (item) => item.column === targetSlot
      );
      const processedTiles = playerDecks?.p1?.filter(
        (item) => item.column !== currentSlot && item.column !== targetSlot
      );
      const result = [
        ...(processedTiles ?? []),
        { ...draggedTile, column: targetSlot },
      ];
      if (targetTile) {
        result.push({
          ...targetTile,
          column: draggedTile.column,
        });
      }
      setPlayerDecks((cr) => ({ ...cr, p1: result }));
    },
    [
      playerDecks,
      discardedTiles,
      tileDeck,
      setPlayerDecks,
      setDiscardedTiles,
      setTileDeck,
    ]
  );

  /**
   * Handles tile discarding
   */
  const discardTile = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const tileId = e.dataTransfer.getData("text").split("-").pop();

      if (playing === 1 && playerDecks?.p1?.length === 15) {
        const discardedTile = playerDecks?.p1?.find(
          (item) => item.id === tileId
        );
        setPlayerDecks((cr) => ({
          ...cr,
          p1: [...playerDecks.p1].filter((item) => item.id !== tileId),
        }));
        setDiscardedTiles((current: any) => ({
          ...current,
          p1top2: [...current.p1top2, discardedTile],
        }));
        debugLog("STATE_CHANGES", "Tile discarded, completing turn");
        completeTurn();
      }
    },
    [playing, playerDecks, setPlayerDecks, setDiscardedTiles, completeTurn]
  );

  return {
    allowDrop,
    onDrag,
    onDrop,
    discardTile,
  };
}
