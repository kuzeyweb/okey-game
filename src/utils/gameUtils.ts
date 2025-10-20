export type Tile = {
  id: string;
  num: number;
  colorVariant: number;
  joker?: boolean;
  column?: number;
  onGround?: boolean;
};

export const allTiles = [
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c11${index}`,
    num: index + 1,
    colorVariant: 1,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c12${index}`,
    num: index + 1,
    colorVariant: 1,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c21${index}`,
    num: index + 1,
    colorVariant: 2,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c22${index}`,
    num: index + 1,
    colorVariant: 2,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c31${index}`,
    num: index + 1,
    colorVariant: 3,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c32${index}`,
    num: index + 1,
    colorVariant: 3,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c41${index}`,
    num: index + 1,
    colorVariant: 4,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c42${index}`,
    num: index + 1,
    colorVariant: 4,
    column: undefined,
  })),
];

export const shuffle = (array: any) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const removeDuplicates = (arr: any, prop: any) => {
  const seen: Record<string, boolean> = {};
  return arr.filter((obj: any) => {
    const key = `${obj[prop]}`;
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
};

export const checkForRuns = (cloneDeck: any[]) => {
  // Check for runs in each colorVariant
  const runs: any[][] = [];
  const colorVariants = [1, 2, 3, 4];

  const sortedByColorAndNum = cloneDeck.sort((a, b) => {
    if (a.colorVariant !== b.colorVariant) {
      return a.colorVariant - b.colorVariant;
    }
    return a.num - b.num;
  });
  colorVariants.forEach((color) => {
    const currentVariant = [...sortedByColorAndNum].filter(
      (item) => item.colorVariant === color
    );
    if (currentVariant[0]?.num === 1) currentVariant.push(currentVariant[0]);
    let currentRun: any[] = [];
    for (let i = 0; i < currentVariant.length - 1; i++) {
      if (
        currentVariant[i + 1].num === currentVariant[i].num + 1 ||
        currentVariant[i].num - currentVariant[i + 1].num === 12 ||
        currentVariant[i + 1].num === currentVariant[i].num
      ) {
        // Extend the current run
        if (currentRun.length === 0) {
          currentRun.push(currentVariant[i]);
        }
        currentRun.push(currentVariant[i + 1]);
      } else {
        // End the current run
        if (currentRun.length >= 3) {
          const runWoDuplicate = removeDuplicates(currentRun, "num");
          runs.push([...runWoDuplicate]);
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
    if (currentRun.length >= 3) {
      const runWoDuplicate = removeDuplicates(currentRun, "num");
      runs.push(runWoDuplicate);
      cloneDeck = cloneDeck.filter(
        (item) =>
          !runWoDuplicate.map((runItem: any) => runItem.id).includes(item.id)
      );
    }
  });

  return { cloneDeck, runs };
};

export const checkForSets = (cloneDeck: any[], min: number = 2) => {
  const sets: any[] = [];
  Array.from({ length: 13 }).forEach((_, index) => {
    const sameNums = [...cloneDeck].filter((tile) => tile.num === index + 1);
    if (sameNums.length > min) {
      const numSet = new Set(sameNums.map((tile) => tile.colorVariant));
      if (numSet.size > min) {
        const uniqueColorVariants = Object.values(
          sameNums.reduce((acc, tile) => {
            if (
              !acc.find((item: any) => item.colorVariant === tile.colorVariant)
            )
              acc.push(tile);
            return acc;
          }, [])
        );
        sets.push(uniqueColorVariants);
        cloneDeck = cloneDeck.filter(
          (tile) =>
            !uniqueColorVariants.map((item: any) => item.id).includes(tile.id)
        );
      }
    }
  });

  return { sets, cloneDeck };
};

export const groupConsecutiveColumns = (deck: any[]) => {
  // Sort the deck by column number
  const sortedDeck = [...deck].sort((a, b) => a.column - b.column);

  const groups = [];
  let currentGroup: any = [];

  // Iterate over the sorted deck to find consecutive column numbers
  sortedDeck.forEach((tile, index) => {
    if (index === 0 || tile.column === sortedDeck[index - 1].column + 1) {
      // Add the column number to the current group
      currentGroup.push(tile);
    } else {
      // Start a new group
      groups.push([...currentGroup]);
      currentGroup = [tile];
    }
  });

  // Add the last group
  if (currentGroup.length > 0) {
    groups.push([...currentGroup]);
  }

  return groups;
};

export const pickRandomTiles = (tileDeck: any, count: number) => {
  const shuffledTiles = shuffle(tileDeck);
  const pickedTiles = [];
  const pickedTileIndexes = new Set();

  while (pickedTiles.length < count && shuffledTiles.length > 0) {
    const tileIndex = Math.floor(Math.random() * shuffledTiles.length);
    if (!pickedTileIndexes.has(tileIndex)) {
      pickedTiles.push(shuffledTiles[tileIndex]);
      pickedTileIndexes.add(tileIndex);
    }
  }

  const remainingTiles = shuffledTiles.filter(
    (_, index) => !pickedTileIndexes.has(index)
  );

  return { pickedTiles, remainingTiles };
};
