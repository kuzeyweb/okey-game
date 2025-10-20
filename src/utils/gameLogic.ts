import {
  checkForRuns,
  checkForSets,
  groupConsecutiveColumns,
  pickRandomTiles,
  allTiles,
} from "./gameUtils";

export type PlayerDecks = { p1: any[]; p2: any[]; p3: any[]; p4: any[] };

export function distributeTilesWithOkey() {
  const { pickedTiles: okeyPick, remainingTiles: afterOkey } = pickRandomTiles(
    allTiles,
    1
  );
  const Okey = afterOkey.find(
    (item) =>
      item.colorVariant === okeyPick[0].colorVariant ||
      item.num === (okeyPick[0].num === 13 ? 1 : okeyPick[0].num + 1)
  );
  const { pickedTiles: playerOne, remainingTiles: afterFirst } =
    pickRandomTiles(
      [
        ...afterOkey,
        {
          id: "j0",
          num: okeyPick[0].num,
          colorVariant: okeyPick[0].colorVariant,
          joker: true,
          column: undefined,
          onGround: false,
        } as any,
        {
          id: "j0",
          num: okeyPick[0].num,
          colorVariant: okeyPick[0].colorVariant,
          joker: true,
          column: undefined,
          onGround: false,
        } as any,
      ],
      15
    );
  const { pickedTiles: playerTwo, remainingTiles: afterSecond } =
    pickRandomTiles(afterFirst, 14);
  const { pickedTiles: playerThree, remainingTiles: afterThird } =
    pickRandomTiles(afterSecond, 14);
  const { pickedTiles: playerFour, remainingTiles: afterFourth } =
    pickRandomTiles(afterThird, 14);

  const playerDecks: PlayerDecks = {
    p1: playerOne.map((item: any, index: number) => ({
      ...item,
      column: index + 1,
    })),
    p2: playerTwo.map((item: any, index: number) => ({
      ...item,
      column: index + 1,
    })),
    p3: playerThree.map((item: any, index: number) => ({
      ...item,
      column: index + 1,
    })),
    p4: playerFour.map((item: any, index: number) => ({
      ...item,
      column: index + 1,
    })),
  };

  return { tileDeck: afterFourth, okey: Okey, playerDecks };
}

export function groupDeckWithOkey(deck: any[], okey: any) {
  const okeysInDeck =
    deck?.filter(
      (item: any) =>
        item.num === okey?.num &&
        item.colorVariant === okey?.colorVariant &&
        item.joker !== true
    ) ?? [];
  let cloneDeck = [
    ...(deck?.filter(
      (item: any) => !okeysInDeck.find((ok: any) => ok.id === item.id)
    ) ?? []),
  ];

  const { runs, cloneDeck: runsRemovedCloneDeck } = checkForRuns(cloneDeck);
  const { sets, cloneDeck: setsRemovedCloneDeck } =
    checkForSets(runsRemovedCloneDeck);
  const { sets: doubleSets, cloneDeck: resultCloneDeck } = checkForSets(
    setsRemovedCloneDeck,
    1
  );
  if (doubleSets) sets.push(...doubleSets);
  let lastGroupEndIndex = 0;
  const setsAndRuns = sets.concat(runs);

  const combinedArray = [
    ...setsAndRuns
      .sort((a, b) => a.length - b.length)
      .map((item) => {
        if (item.length < 4 && okeysInDeck[0]) {
          const ok = [...okeysInDeck][0];
          delete okeysInDeck[0];
          return [...item, ok];
        } else if (item.length < 4 && okeysInDeck[1]) {
          const ok = [...okeysInDeck][1];
          delete okeysInDeck[1];
          return [...item, ok];
        }
        return item;
      })
      .sort((a, b) => b.length - a.length)
      .reduce(
        (acc, val) =>
          acc.concat(
            val.map((item: any, index: number) => {
              const prev = lastGroupEndIndex;
              if (index === val.length - 1) {
                lastGroupEndIndex + index + 3 !== 13
                  ? (lastGroupEndIndex += index + 2)
                  : (lastGroupEndIndex += index + 3);
              }
              return {
                ...item,
                column: prev + index + 1,
              };
            })
          ),
        [] as any[]
      ),
    ...resultCloneDeck.map((item, index) => ({
      ...item,
      column: 25 - index + 1,
    })),
  ];

  return combinedArray;
}

export function isWinningDeck(deck: any[], okey: any) {
  if (deck.length !== 15) return false;
  const consecutiveCols = groupConsecutiveColumns(deck);
  let currentPoint = 0;
  consecutiveCols.forEach((col) => {
    const sameColors = col.every(
      (item: any) =>
        item.colorVariant === col[0].colorVariant ||
        (item.num === okey.num && item.colorVariant === okey.colorVariant)
    );
    const sameNums = col.every(
      (item: any) =>
        item.num === col[0].num ||
        (item.num === okey.num && item.colorVariant === okey.colorVariant)
    );
    if (sameColors) {
      const isConsecutive = col.every((item: any, index: number) =>
        index === 0
          ? true
          : item.num - 1 === col[index - 1]?.num ||
            item.num + 1 === col[index - 1]?.num ||
            (item?.num === 1 && col[index - 1]?.num === 13) ||
            (item.num === okey.num && item.colorVariant === okey.colorVariant)
      );
      if (isConsecutive && col.length > 2) currentPoint += col.length;
    } else if (sameNums) {
      const isUniqueColors = col.every((item: any, _: any, arr: any[]) => {
        return (
          arr.filter(
            (tile) =>
              tile.colorVariant === item.colorVariant &&
              item.num !== okey.num &&
              item.colorVariant !== okey.colorVariant
          ).length < 2 ||
          (item.num === okey.num && item.colorVariant === okey.colorVariant)
        );
      });
      if (isUniqueColors && col.length > 2) currentPoint += col.length;
    }
  });
  return currentPoint === 14;
}

export function improvesPointWith(
  deck: any[],
  newTile: any,
  okey: any,
  prevPoint: number
) {
  const groupedDeck = groupDeckWithOkey([...deck, newTile], okey);
  const consecutiveCols = groupConsecutiveColumns(groupedDeck);
  let totalPoint = 0;
  consecutiveCols.forEach((item, index) => {
    if (item.length > 2 && index !== consecutiveCols.length - 1)
      totalPoint += item.length;
  });
  return totalPoint > prevPoint;
}
