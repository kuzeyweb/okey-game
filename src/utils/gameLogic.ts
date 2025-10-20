import { debugLog } from "../config/debug";
import { allTiles, shuffle, type Tile } from "./gameUtils";

/**
 * Game Logic Utilities
 *
 * Contains core game logic functions for the Okey game including:
 * - Tile distribution and deck management
 * - Winning condition checking
 * - Game state evaluation
 * - AI decision making utilities
 */

/**
 * Distribute tiles to all players with okey selection
 */
export const distributeTilesWithOkey = () => {
  debugLog("GAME_LOGIC", "Distributing tiles with okey");

  const shuffledTiles = shuffle(allTiles);
  const okey = shuffledTiles[0];
  const remainingTiles = shuffledTiles.slice(1);

  debugLog("GAME_LOGIC", "Okey selected", {
    okeyTile: okey.id,
    okeyNumber: okey.num,
    okeyColor: okey.colorVariant,
  });

  const playerDecks = {
    p1: remainingTiles
      .slice(0, 14)
      .map((tile, index) => ({ ...tile, column: index + 1 })),
    p2: remainingTiles
      .slice(14, 28)
      .map((tile, index) => ({ ...tile, column: index + 1 })),
    p3: remainingTiles
      .slice(28, 42)
      .map((tile, index) => ({ ...tile, column: index + 1 })),
    p4: remainingTiles
      .slice(42, 56)
      .map((tile, index) => ({ ...tile, column: index + 1 })),
  };

  const tileDeck = remainingTiles.slice(56);

  debugLog("GAME_LOGIC", "Tiles distributed", {
    okeyTile: okey.id,
    playerDecksLength: {
      p1: playerDecks.p1.length,
      p2: playerDecks.p2.length,
      p3: playerDecks.p3.length,
      p4: playerDecks.p4.length,
    },
    remainingTiles: tileDeck.length,
  });

  return { tileDeck, okey, playerDecks };
};

/**
 * Group deck with okey logic applied
 */
export const groupDeckWithOkey = (deck: Tile[], okey: Tile): Tile[] => {
  debugLog("GAME_LOGIC", "Grouping deck with okey", {
    deckLength: deck.length,
    okeyTile: okey.id,
  });

  const grouped = deck.map((tile) => {
    if (tile.joker) {
      // Joker tiles
      return { ...tile, num: okey.num, colorVariant: okey.colorVariant };
    } else if (
      tile.num === okey.num &&
      tile.colorVariant === okey.colorVariant
    ) {
      // Okey tiles become jokers
      return { ...tile, joker: true, num: 0, colorVariant: 0 };
    }
    return tile;
  });

  debugLog("GAME_LOGIC", "Deck grouped with okey", {
    originalLength: deck.length,
    groupedLength: grouped.length,
    jokersCount: grouped.filter((t) => t.joker).length,
  });

  return grouped;
};

/**
 * Check if deck is a winning deck
 */
export const isWinningDeck = (deck: Tile[], okey: Tile): boolean => {
  debugLog("GAME_LOGIC", "Checking winning condition", {
    deckLength: deck.length,
    okeyTile: okey.id,
  });

  if (deck.length !== 14) {
    debugLog("GAME_LOGIC", "Not winning - wrong deck length", {
      deckLength: deck.length,
    });
    return false;
  }

  // Group tiles by runs and sets
  const runs: Tile[][] = [];
  const sets: Tile[][] = [];
  const remaining = [...deck];

  // Try to find runs first
  for (let i = 0; i < remaining.length; i++) {
    const tile = remaining[i];
    if (!tile) continue;

    const run = [tile];
    for (let j = i + 1; j < remaining.length; j++) {
      const nextTile = remaining[j];
      if (
        nextTile &&
        nextTile.colorVariant === tile.colorVariant &&
        nextTile.num === tile.num + run.length
      ) {
        run.push(nextTile);
      }
    }

    if (run.length >= 3) {
      runs.push(run);
      run.forEach((t) => {
        const index = remaining.findIndex((r) => r.id === t.id);
        if (index !== -1) remaining.splice(index, 1);
      });
      i = -1; // Restart loop
    }
  }

  // Try to find sets with remaining tiles
  for (let i = 0; i < remaining.length; i++) {
    const tile = remaining[i];
    if (!tile) continue;

    const set = [tile];
    for (let j = i + 1; j < remaining.length; j++) {
      const nextTile = remaining[j];
      if (
        nextTile &&
        nextTile.num === tile.num &&
        nextTile.colorVariant !== tile.colorVariant
      ) {
        set.push(nextTile);
      }
    }

    if (set.length >= 3) {
      sets.push(set);
      set.forEach((t) => {
        const index = remaining.findIndex((r) => r.id === t.id);
        if (index !== -1) remaining.splice(index, 1);
      });
      i = -1; // Restart loop
    }
  }

  const isWinning =
    remaining.length === 0 && (runs.length > 0 || sets.length > 0);

  debugLog("GAME_LOGIC", "Winning check result", {
    isWinning,
    runsCount: runs.length,
    setsCount: sets.length,
    remainingTiles: remaining.length,
    runsSizes: runs.map((r) => r.length),
    setsSizes: sets.map((s) => s.length),
  });

  return isWinning;
};

/**
 * Check if adding a tile improves the deck's point value
 */
export const improvesPointWith = (
  deck: Tile[],
  tile: Tile,
  okey: Tile,
  currentPoint: number
): boolean => {
  debugLog("GAME_LOGIC", "Checking if tile improves points", {
    deckLength: deck.length,
    tileId: tile.id,
    currentPoint,
  });

  const deckWithTile = [...deck, tile];
  const groupedDeck = groupDeckWithOkey(deckWithTile, okey);

  // Calculate new points
  let newPoint = 0;
  const runs: Tile[][] = [];
  const sets: Tile[][] = [];
  const remaining = [...groupedDeck];

  // Find runs
  for (let i = 0; i < remaining.length; i++) {
    const tile = remaining[i];
    if (!tile) continue;

    const run = [tile];
    for (let j = i + 1; j < remaining.length; j++) {
      const nextTile = remaining[j];
      if (
        nextTile &&
        nextTile.colorVariant === tile.colorVariant &&
        nextTile.num === tile.num + run.length
      ) {
        run.push(nextTile);
      }
    }

    if (run.length >= 3) {
      runs.push(run);
      run.forEach((t) => {
        const index = remaining.findIndex((r) => r.id === t.id);
        if (index !== -1) remaining.splice(index, 1);
      });
      i = -1;
    }
  }

  // Find sets
  for (let i = 0; i < remaining.length; i++) {
    const tile = remaining[i];
    if (!tile) continue;

    const set = [tile];
    for (let j = i + 1; j < remaining.length; j++) {
      const nextTile = remaining[j];
      if (
        nextTile &&
        nextTile.num === tile.num &&
        nextTile.colorVariant !== tile.colorVariant
      ) {
        set.push(nextTile);
      }
    }

    if (set.length >= 3) {
      sets.push(set);
      set.forEach((t) => {
        const index = remaining.findIndex((r) => r.id === t.id);
        if (index !== -1) remaining.splice(index, 1);
      });
      i = -1;
    }
  }

  // Calculate points
  runs.forEach((run) => {
    if (run.length > 2) newPoint += run.length;
  });

  sets.forEach((set) => {
    if (set.length > 2) newPoint += set.length;
  });

  const improves = newPoint > currentPoint;

  debugLog("GAME_LOGIC", "Point improvement check result", {
    improves,
    currentPoint,
    newPoint,
    runsCount: runs.length,
    setsCount: sets.length,
    tileId: tile.id,
  });

  return improves;
};
