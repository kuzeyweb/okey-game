import { debugLog } from "../config/debug";

/**
 * Game Utilities
 *
 * Contains pure utility functions for the Okey game including:
 * - Tile definitions and constants
 * - Array manipulation functions (shuffle, removeDuplicates)
 * - Game logic utilities (checkForRuns, checkForSets, groupConsecutiveColumns)
 * - Random tile selection
 */

// Tile type definition
export interface Tile {
  id: string;
  num: number;
  colorVariant: number;
  joker?: boolean;
  column?: number;
  onGround?: boolean;
}

// All possible tiles in Okey game (106 tiles total)
export const allTiles: Tile[] = [
  // Red tiles (1-13, 2 sets)
  ...Array.from({ length: 2 }, (_, setIndex) =>
    Array.from({ length: 13 }, (_, i) => ({
      id: `red-${setIndex}-${i + 1}`,
      num: i + 1,
      colorVariant: 1,
      column: undefined,
    }))
  ).flat(),

  // Blue tiles (1-13, 2 sets)
  ...Array.from({ length: 2 }, (_, setIndex) =>
    Array.from({ length: 13 }, (_, i) => ({
      id: `blue-${setIndex}-${i + 1}`,
      num: i + 1,
      colorVariant: 2,
      column: undefined,
    }))
  ).flat(),

  // Green tiles (1-13, 2 sets)
  ...Array.from({ length: 2 }, (_, setIndex) =>
    Array.from({ length: 13 }, (_, i) => ({
      id: `green-${setIndex}-${i + 1}`,
      num: i + 1,
      colorVariant: 3,
      column: undefined,
    }))
  ).flat(),

  // Black tiles (1-13, 2 sets)
  ...Array.from({ length: 2 }, (_, setIndex) =>
    Array.from({ length: 13 }, (_, i) => ({
      id: `black-${setIndex}-${i + 1}`,
      num: i + 1,
      colorVariant: 4,
      column: undefined,
    }))
  ).flat(),

  // Jokers (2 tiles)
  { id: "joker-1", num: 0, colorVariant: 0, joker: true, column: undefined },
  { id: "joker-2", num: 0, colorVariant: 0, joker: true, column: undefined },
];

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export const shuffle = (array: any[]): any[] => {
  debugLog("GAME_UTILS", "Shuffling array", { arrayLength: array.length });
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  debugLog("GAME_UTILS", "Array shuffled", { shuffledLength: shuffled.length });
  return shuffled;
};

/**
 * Remove duplicate tiles from array
 */
export const removeDuplicates = (tiles: Tile[]): Tile[] => {
  debugLog("GAME_UTILS", "Removing duplicates", {
    originalLength: tiles.length,
  });
  const unique = tiles.filter(
    (tile, index, self) => index === self.findIndex((t) => t.id === tile.id)
  );
  debugLog("GAME_UTILS", "Duplicates removed", {
    originalLength: tiles.length,
    uniqueLength: unique.length,
  });
  return unique;
};

/**
 * Check if tiles form a valid run (consecutive numbers of same color)
 */
export const checkForRuns = (tiles: Tile[]): boolean => {
  debugLog("GAME_UTILS", "Checking for runs", { tilesCount: tiles.length });

  if (tiles.length < 3) {
    debugLog("GAME_UTILS", "Not enough tiles for run", {
      tilesCount: tiles.length,
    });
    return false;
  }

  const sortedTiles = tiles.sort((a, b) => a.num - b.num);
  const color = sortedTiles[0].colorVariant;

  // Check if all tiles are same color
  const sameColor = sortedTiles.every((tile) => tile.colorVariant === color);
  if (!sameColor) {
    debugLog("GAME_UTILS", "Run check failed - different colors");
    return false;
  }

  // Check if numbers are consecutive
  const consecutive = sortedTiles.every(
    (tile, index) => index === 0 || tile.num === sortedTiles[index - 1].num + 1
  );

  debugLog("GAME_UTILS", "Run check result", {
    isRun: consecutive,
    tilesCount: tiles.length,
    color,
  });

  return consecutive;
};

/**
 * Check if tiles form a valid set (same number, different colors)
 */
export const checkForSets = (tiles: Tile[]): boolean => {
  debugLog("GAME_UTILS", "Checking for sets", { tilesCount: tiles.length });

  if (tiles.length < 3) {
    debugLog("GAME_UTILS", "Not enough tiles for set", {
      tilesCount: tiles.length,
    });
    return false;
  }

  const number = tiles[0].num;
  const colors = tiles.map((tile) => tile.colorVariant);
  const uniqueColors = [...new Set(colors)];

  // Check if all tiles have same number and different colors
  const sameNumber = tiles.every((tile) => tile.num === number);
  const differentColors = uniqueColors.length === tiles.length;

  debugLog("GAME_UTILS", "Set check result", {
    isSet: sameNumber && differentColors,
    tilesCount: tiles.length,
    number,
    uniqueColors: uniqueColors.length,
  });

  return sameNumber && differentColors;
};

/**
 * Group consecutive columns in a deck
 */
export const groupConsecutiveColumns = (deck: Tile[]): Tile[][] => {
  debugLog("GAME_UTILS", "Grouping consecutive columns", {
    deckLength: deck.length,
  });

  const sortedDeck = [...deck].sort(
    (a, b) => (a.column || 0) - (b.column || 0)
  );
  const groups: Tile[][] = [];
  let currentGroup: Tile[] = [];

  for (let i = 0; i < sortedDeck.length; i++) {
    const currentTile = sortedDeck[i];
    const prevTile = sortedDeck[i - 1];

    if (
      i === 0 ||
      !prevTile ||
      (currentTile.column || 0) === (prevTile.column || 0) + 1
    ) {
      currentGroup.push(currentTile);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [currentTile];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  debugLog("GAME_UTILS", "Consecutive columns grouped", {
    groupsCount: groups.length,
    groupSizes: groups.map((g) => g.length),
  });

  return groups;
};

/**
 * Pick random tiles from array
 */
export const pickRandomTiles = (tiles: Tile[], count: number): Tile[] => {
  debugLog("GAME_UTILS", "Picking random tiles", {
    availableTiles: tiles.length,
    requestedCount: count,
  });

  const shuffled = shuffle(tiles);
  const picked = shuffled.slice(0, count);

  debugLog("GAME_UTILS", "Random tiles picked", {
    pickedCount: picked.length,
    pickedIds: picked.map((t) => t.id),
  });

  return picked;
};
