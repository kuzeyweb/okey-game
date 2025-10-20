import { useCallback } from "react";
import { debugLog } from "../config/debug";

/**
 * useDragDrop Hook
 *
 * Custom hook that manages all drag and drop functionality for the Okey game.
 * Handles tile dragging from various sources (ground, discarded tiles, player slots)
 * and dropping to different targets.
 *
 * Features:
 * - Drag from ground tiles
 * - Drag from discarded tiles
 * - Drag between player slots
 * - Tile discarding functionality
 * - Automatic slot assignment
 */
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
  debugLog("USE_DRAG_DROP", "Hook initialized", {
    playing,
    tileDeckLength: tileDeck.length,
    playerDecksLength: {
      p1: playerDecks.p1.length,
      p2: playerDecks.p2.length,
      p3: playerDecks.p3.length,
      p4: playerDecks.p4.length,
    },
  });

  /**
   * Allow drop event - prevents default behavior
   */
  const allowDrop = useCallback((e: React.DragEvent) => {
    debugLog("USE_DRAG_DROP", "Allow drop", { target: e.currentTarget.id });
    e.preventDefault();
  }, []);

  /**
   * Handle drag start - sets data transfer
   */
  const onDrag = useCallback((e: React.DragEvent) => {
    const tileId = e.currentTarget.id;
    debugLog("USE_DRAG_DROP", "Drag start", { tileId });
    e.dataTransfer.setData("text", tileId);
  }, []);

  /**
   * Handle drop event - main drop logic
   */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("text");
      const currentSlot = Number(data.split("-")[0]);
      const targetSlot = Number(e.currentTarget.id.split("-").pop());

      debugLog("USE_DRAG_DROP", "Drop event", {
        data,
        currentSlot,
        targetSlot,
        targetElement: e.currentTarget.id,
      });

      if (!targetSlot) return;

      if (!currentSlot) {
        // Dragging from discarded tiles or ground
        const draggedTile = discardedTiles?.p4top1?.find(
          (item: any) => item.id === data
        );

        if (!draggedTile) {
          // Dragging from ground
          debugLog("USE_DRAG_DROP", "Dragging from ground", {
            tileDeckLength: tileDeck.length,
            playerDeckLength: playerDecks.p1.length,
          });

          if (tileDeck.length < 1) {
            debugLog("USE_DRAG_DROP", "No tiles left on ground");
            return window.alert("Yerde taş kalmadı, oyun bitti.");
          }
          if (playerDecks.p1.length === 15) {
            debugLog(
              "USE_DRAG_DROP",
              "Player deck full, cannot take from ground"
            );
            return;
          }

          const pulledTile = tileDeck[0];
          debugLog("USE_DRAG_DROP", "Pulling tile from ground", {
            pulledTile: pulledTile.id,
            targetSlot,
          });

          setTileDeck((cr) =>
            [...cr].filter((item) => item.id !== pulledTile.id)
          );
          setPlayerDecks((cr) => {
            let target = targetSlot;
            while (cr.p1.find((item) => item.column === target)) {
              target++;
            }
            debugLog("USE_DRAG_DROP", "Assigned slot", {
              originalTarget: targetSlot,
              finalTarget: target,
            });
            return {
              ...cr,
              p1: [...cr.p1, { ...pulledTile, column: target }],
            };
          });
          return;
        }

        // Dragging from discarded tiles
        debugLog("USE_DRAG_DROP", "Dragging from discarded tiles", {
          draggedTile: draggedTile.id,
          targetSlot,
        });

        setDiscardedTiles((cr: any) => ({
          ...cr,
          p4top1: [...cr.p4top1].filter((item) => item.id !== draggedTile.id),
        }));
        setPlayerDecks((cr) => {
          let target = targetSlot;
          while (cr.p1.find((item) => item.column === target)) {
            target++;
          }
          debugLog("USE_DRAG_DROP", "Assigned slot for discarded tile", {
            originalTarget: targetSlot,
            finalTarget: target,
          });
          return {
            ...cr,
            p1: [...cr.p1, { ...draggedTile, column: target }],
          };
        });
        return;
      }

      // Dragging between player slots
      debugLog("USE_DRAG_DROP", "Dragging between slots", {
        currentSlot,
        targetSlot,
      });

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

      debugLog("USE_DRAG_DROP", "Slot swap completed", {
        draggedTile: draggedTile?.id,
        targetTile: targetTile?.id,
        resultLength: result.length,
      });

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
   * Handle tile discarding
   */
  const discardTile = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const tileId = e.dataTransfer.getData("text").split("-").pop();

      debugLog("USE_DRAG_DROP", "Discarding tile", {
        tileId,
        playing,
        playerDeckLength: playerDecks?.p1?.length,
      });

      if (playing === 1 && playerDecks?.p1?.length === 15) {
        const discardedTile = playerDecks?.p1?.find(
          (item) => item.id === tileId
        );
        debugLog("USE_DRAG_DROP", "Tile discarded successfully", {
          discardedTile: discardedTile?.id,
        });

        setPlayerDecks((cr) => ({
          ...cr,
          p1: [...playerDecks.p1].filter((item) => item.id !== tileId),
        }));
        setDiscardedTiles((current: any) => ({
          ...current,
          p1top2: [...current.p1top2, discardedTile],
        }));
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
