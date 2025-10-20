/**
 * Tile interface defining the structure of game tiles
 */
export type Tile = {
  id: string;
  num: number;
  colorVariant: number;
  joker?: boolean;
  column?: number;
  onGround?: boolean;
};

/**
 * Complete set of tiles for the Okey game
 * Contains 8 sets of 13 tiles each (numbers 1-13) across 4 color variants
 * Total: 104 tiles (no jokers in this implementation)
 */
export const allTiles = [
  // Color variant 1 - First set (Red)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c11${index}`,
    num: index + 1,
    colorVariant: 1,
    column: undefined,
  })),
  // Color variant 1 - Second set (Red)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c12${index}`,
    num: index + 1,
    colorVariant: 1,
    column: undefined,
  })),
  // Color variant 2 - First set (Blue)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c21${index}`,
    num: index + 1,
    colorVariant: 2,
    column: undefined,
  })),
  // Color variant 2 - Second set (Blue)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c22${index}`,
    num: index + 1,
    colorVariant: 2,
    column: undefined,
  })),
  // Color variant 3 - First set (Green)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c31${index}`,
    num: index + 1,
    colorVariant: 3,
    column: undefined,
  })),
  // Color variant 3 - Second set (Green)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c32${index}`,
    num: index + 1,
    colorVariant: 3,
    column: undefined,
  })),
  // Color variant 4 - First set (Yellow)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c41${index}`,
    num: index + 1,
    colorVariant: 4,
    column: undefined,
  })),
  // Color variant 4 - Second set (Yellow)
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c42${index}`,
    num: index + 1,
    colorVariant: 4,
    column: undefined,
  })),
];

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * Creates a random permutation of the input array
 * @param array - The array to shuffle
 * @returns A new shuffled array (original array is not modified)
 */
export const shuffle = (array: any) => {
  // Create a copy of the array to avoid mutating the original
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at positions i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/**
 * Removes duplicate objects from an array based on a specific property
 * Uses a hash map to track seen values for O(1) lookup performance
 * @param arr - The array to remove duplicates from
 * @param prop - The property name to check for duplicates
 * @returns A new array with duplicates removed
 */
export const removeDuplicates = (arr: any, prop: any) => {
  // Hash map to track which property values we've already seen
  const seen: Record<string, boolean> = {};

  // Filter the array, keeping only objects with unique property values
  return arr.filter((obj: any) => {
    // Create a string key from the property value
    const key = `${obj[prop]}`;

    // If we've seen this key before, exclude this object
    if (seen[key]) {
      return false;
    }

    // Mark this key as seen and include this object
    seen[key] = true;
    return true;
  });
};

/**
 * Checks for valid runs (consecutive sequences) in a deck of tiles
 * A run is 3+ consecutive tiles of the same color (e.g., 1-2-3, 11-12-13-1)
 * Handles wraparound from 13 to 1 in Okey rules
 * @param cloneDeck - The deck to analyze for runs
 * @returns Object containing the remaining deck and found runs
 */
export const checkForRuns = (cloneDeck: any[]) => {
  // Array to store all valid runs found
  const runs: any[][] = [];
  // All possible color variants in the game
  const colorVariants = [1, 2, 3, 4];

  // Sort tiles by color variant first, then by number
  const sortedByColorAndNum = cloneDeck.sort((a, b) => {
    if (a.colorVariant !== b.colorVariant) {
      return a.colorVariant - b.colorVariant;
    }
    return a.num - b.num;
  });

  // Check each color variant for runs
  colorVariants.forEach((color) => {
    // Get all tiles of the current color variant
    const currentVariant = [...sortedByColorAndNum].filter(
      (item) => item.colorVariant === color
    );

    // Handle wraparound: if we have tile 1, add it at the end for 13-1-2 sequences
    if (currentVariant[0]?.num === 1) currentVariant.push(currentVariant[0]);

    let currentRun: any[] = [];

    // Check for consecutive sequences
    for (let i = 0; i < currentVariant.length - 1; i++) {
      if (
        // Normal consecutive: 1-2, 2-3, etc.
        currentVariant[i + 1].num === currentVariant[i].num + 1 ||
        // Wraparound: 13-1 (difference of 12)
        currentVariant[i].num - currentVariant[i + 1].num === 12 ||
        // Same number (for duplicate tiles)
        currentVariant[i + 1].num === currentVariant[i].num
      ) {
        // Extend the current run
        if (currentRun.length === 0) {
          currentRun.push(currentVariant[i]);
        }
        currentRun.push(currentVariant[i + 1]);
      } else {
        // End the current run - check if it's valid (3+ tiles)
        if (currentRun.length >= 3) {
          // Remove duplicates from the run
          const runWoDuplicate = removeDuplicates(currentRun, "num");
          runs.push([...runWoDuplicate]);

          // Remove tiles used in this run from the deck
          cloneDeck = cloneDeck.filter(
            (item) =>
              !runWoDuplicate
                .map((runItem: any) => runItem.id)
                .includes(item.id)
          );
        }
        currentRun = [];
      }
    }

    // Check if the last tile completes a run
    if (
      currentRun.length >= 3 &&
      currentVariant[currentVariant.length - 1].num ===
        currentRun[currentRun.length - 1].num + 1
    ) {
      currentRun.push(currentVariant[currentVariant.length - 1]);
    }

    // Final check for valid runs
    if (currentRun.length >= 3) {
      const runWoDuplicate = removeDuplicates(currentRun, "num");
      runs.push(runWoDuplicate);

      // Remove tiles used in this run from the deck
      cloneDeck = cloneDeck.filter(
        (item) =>
          !runWoDuplicate.map((runItem: any) => runItem.id).includes(item.id)
      );
    }
  });

  return { cloneDeck, runs };
};

/**
 * Checks for valid sets (same number, different colors) in a deck of tiles
 * A set is 3+ tiles with the same number but different color variants
 * @param cloneDeck - The deck to analyze for sets
 * @param min - Minimum number of tiles required for a valid set (default: 2)
 * @returns Object containing the remaining deck and found sets
 */
export const checkForSets = (cloneDeck: any[], min: number = 2) => {
  // Array to store all valid sets found
  const sets: any[] = [];

  // Check each possible number (1-13) for sets
  Array.from({ length: 13 }).forEach((_, index) => {
    // Get all tiles with the current number
    const sameNums = [...cloneDeck].filter((tile) => tile.num === index + 1);

    // Check if we have enough tiles for a set
    if (sameNums.length > min) {
      // Check if we have different color variants
      const numSet = new Set(sameNums.map((tile) => tile.colorVariant));

      if (numSet.size > min) {
        // Get unique color variants (remove duplicates)
        const uniqueColorVariants = Object.values(
          sameNums.reduce((acc, tile) => {
            // Only add if we haven't seen this color variant before
            if (
              !acc.find((item: any) => item.colorVariant === tile.colorVariant)
            )
              acc.push(tile);
            return acc;
          }, [])
        );

        // Add this set to our results
        sets.push(uniqueColorVariants);

        // Remove tiles used in this set from the deck
        cloneDeck = cloneDeck.filter(
          (tile) =>
            !uniqueColorVariants.map((item: any) => item.id).includes(tile.id)
        );
      }
    }
  });

  return { sets, cloneDeck };
};

/**
 * Groups tiles by consecutive column positions
 * Used to identify tiles that are positioned next to each other in the player's hand
 * @param deck - The deck of tiles to group
 * @returns Array of groups, where each group contains tiles with consecutive column numbers
 */
export const groupConsecutiveColumns = (deck: any[]) => {
  // Sort the deck by column number to process in order
  const sortedDeck = [...deck].sort((a, b) => a.column - b.column);

  // Array to store groups of consecutive tiles
  const groups = [];
  // Current group being built
  let currentGroup: any = [];

  // Iterate over the sorted deck to find consecutive column numbers
  sortedDeck.forEach((tile, index) => {
    // Check if this tile is consecutive to the previous one
    if (index === 0 || tile.column === sortedDeck[index - 1].column + 1) {
      // Add the tile to the current group
      currentGroup.push(tile);
    } else {
      // Start a new group - save the current one if it has tiles
      groups.push([...currentGroup]);
      currentGroup = [tile];
    }
  });

  // Add the last group if it contains any tiles
  if (currentGroup.length > 0) {
    groups.push([...currentGroup]);
  }

  return groups;
};

/**
 * Picks a specified number of random tiles from a deck
 * Uses shuffling and random selection to ensure fair distribution
 * @param tileDeck - The deck to pick tiles from
 * @param count - Number of tiles to pick
 * @returns Object containing picked tiles and remaining tiles
 */
export const pickRandomTiles = (tileDeck: any, count: number) => {
  // Shuffle the deck to randomize tile order
  const shuffledTiles = shuffle(tileDeck);
  // Array to store the picked tiles
  const pickedTiles = [];
  // Set to track which tile indexes have been picked (prevents duplicates)
  const pickedTileIndexes = new Set();

  // Pick tiles until we have the requested count or run out of tiles
  while (pickedTiles.length < count && shuffledTiles.length > 0) {
    // Generate a random index within the shuffled deck
    const tileIndex = Math.floor(Math.random() * shuffledTiles.length);

    // Only pick this tile if we haven't picked it before
    if (!pickedTileIndexes.has(tileIndex)) {
      pickedTiles.push(shuffledTiles[tileIndex]);
      pickedTileIndexes.add(tileIndex);
    }
  }

  // Create remaining tiles array by filtering out picked tiles
  const remainingTiles = shuffledTiles.filter(
    (_, index) => !pickedTileIndexes.has(index)
  );

  return { pickedTiles, remainingTiles };
};
