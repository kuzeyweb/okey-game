import { useEffect, useState } from "react";
import "./App.css";
import AutoUnmuteYouTube from "./components/YTVideoPlayer";

const allTiles = [
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c11${index}`,
    num: index + 1,
    colorVariant: 1,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c12${index}`,
    num: index + 1,
    colorVariant: 1,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c21${index}`,
    num: index + 1,
    colorVariant: 2,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c22${index}`,
    num: index + 1,
    colorVariant: 2,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c31${index}`,
    num: index + 1,
    colorVariant: 3,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c32${index}`,
    num: index + 1,
    colorVariant: 3,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c41${index}`,
    num: index + 1,
    colorVariant: 4,
    player: undefined,
    column: undefined,
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    id: `c42${index}`,
    num: index + 1,
    colorVariant: 4,
    player: undefined,
    column: undefined,
  })),
];

const shuffle = (array: any) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const removeDuplicates = (arr: any, prop: any) => {
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

const checkForRuns = (cloneDeck: any[]) => {
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

const checkForSets = (cloneDeck: any[], min: number = 2) => {
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

const groupConsecutiveColumns = (deck: any[]) => {
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

function App() {
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

  const pickRandomTiles = (tileDeck: any, count: number) => {
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

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const onDrag = (e: any) => {
    e.dataTransfer.setData("text", e.target.id);
  };

  const onDrop = (e: any) => {
    e.preventDefault();
    var data = e.dataTransfer.getData("text");
    const currentSlot = Number(data.split("-")[0]);
    const targetSlot = Number(e.target.id.split("-").pop());
    if (!targetSlot) return;
    if (!currentSlot) {
      const draggedTile = discardedTiles?.p4top1?.find(
        (item: any) => item.id === data
      );
      if (!draggedTile) {
        if (tileDeck.length < 1)
          return window.alert("Yerde taş kalmadı, oyun bitti.");
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
    const draggedTile = playerDecks?.p1?.find(
      (item) => item.column === currentSlot
    );
    const targetTile = playerDecks?.p1?.find(
      (item) => item.column === targetSlot
    );
    let processedTiles = playerDecks?.p1?.filter(
      (item) => item.column !== currentSlot && item.column !== targetSlot
    );
    const result = [
      ...(processedTiles ?? []),
      { ...draggedTile, column: targetSlot },
    ];
    if (targetTile)
      result.push({
        ...targetTile,
        column: draggedTile.column,
      });
    setPlayerDecks((cr) => ({ ...cr, p1: result }));
  };

  const distributeTiles = () => {
    const { pickedTiles: okey, remainingTiles: afterOkey } = pickRandomTiles(
      allTiles,
      1
    );
    const { pickedTiles: playerOne, remainingTiles: afterFirst } =
      pickRandomTiles(
        [
          ...afterOkey,
          {
            id: "j0",
            num: okey[0].num,
            colorVariant: okey[0].colorVariant,
            joker: true,
            player: undefined,
            column: undefined,
            onGround: false,
          },
          {
            id: "j0",
            num: okey[0].num,
            colorVariant: okey[0].colorVariant,
            joker: true,
            player: undefined,
            column: undefined,
            onGround: false,
          },
        ],
        15
      );
    const { pickedTiles: playerTwo, remainingTiles: afterSecond } =
      pickRandomTiles(afterFirst, 14);
    const { pickedTiles: playerThree, remainingTiles: afterThird } =
      pickRandomTiles(afterSecond, 14);
    const { pickedTiles: playerFour, remainingTiles: afterFourth } =
      pickRandomTiles(afterThird, 14);

    setTileDeck(afterFourth);
    setOkey(okey[0]);
    setPlayerDecks({
      p1: playerOne.map((item: any, index: number) => ({
        ...item,
        player: 1,
        column: index + 1,
      })),
      p2: playerTwo.map((item: any, index: number) => ({
        ...item,
        player: 2,
        column: index + 1,
      })),
      p3: playerThree.map((item: any, index: number) => ({
        ...item,
        player: 3,
        column: index + 1,
      })),
      p4: playerFour.map((item: any, index: number) => ({
        ...item,
        player: 4,
        column: index + 1,
      })),
    });
  };

  const groupDeck = (deck: any) => {
    const okeysInDeck =
      deck?.filter(
        (item: any) =>
          item.num === okey?.num &&
          item.colorVariant === okey?.colorVariant &&
          item.joker !== true
      ) ?? [];
    let cloneDeck = [
      ...(deck?.filter(
        (item: any) => !okeysInDeck.find((okey: any) => okey.id === item.id)
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
            const okey = [...okeysInDeck][0];
            delete okeysInDeck[0];
            return [...item, okey];
          } else if (item.length < 4 && okeysInDeck[1]) {
            const okey = [...okeysInDeck][1];
            delete okeysInDeck[1];
            return [...item, okey];
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
          []
        ),
      ...resultCloneDeck.map((item, index) => ({
        ...item,
        column: 25 - index + 1,
      })),
    ];

    return combinedArray;
  };

  const onAutoSort = () => {
    const result = groupDeck(playerDecks[`p${selectedPlayer as 1}`]);
    setPlayerDecks((cr) => ({ ...cr, [`p${selectedPlayer}`]: result }));
  };

  const discardTile = (e: any) => {
    e.preventDefault();
    var tileId = e.dataTransfer.getData("text").split("-").pop();
    if (playing === 1 && playerDecks?.p1?.length === 15) {
      const discardedTile = playerDecks?.p1?.find((item) => item.id === tileId);
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
  };

  const play = () => {
    const groupedDeck = groupDeck(
      playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`]
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
        discardedTiles[throwedPlayer][discardedTiles[throwedPlayer].length - 1];
      const deckWithThrownTile = [
        ...playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`],
        thrownTile,
      ];
      if (checkIsRequiredTile(deckWithThrownTile, currentPoint)) {
        console.info(
          playing === 1
            ? "4. oyuncunun attığı taş alınıyor."
            : `${playing - 1}. oyuncunun attığı taş alınıyor.`
        );
        setDiscardedTiles((cr: any) => {
          return {
            ...cr,
            [throwedPlayer]: cr[throwedPlayer].filter(
              (item: any) => item.id !== thrownTile.id
            ),
          };
        });
        const groupedDeck = groupDeck(deckWithThrownTile);
        setPlayerDecks((cr) => ({
          ...cr,
          [`p${playing}`]: groupedDeck,
        }));
        if (checkIsWinning(groupedDeck)) {
          console.info(`${playing}. oyuncu oyunu kazandı!`);
        } else {
          botDiscard(
            deckWithThrownTile[deckWithThrownTile.length - 2],
            playing,
            deckWithThrownTile
          );
        }
      } else {
        console.info("Yerden taş alınıyor.");
        if (tileDeck.length < 1)
          return window.alert("Yerde taş kalmadı, oyun bitti.");
        const pulledTile = tileDeck[0];
        setTileDeck((cr) =>
          [...cr].filter((item) => item.id !== pulledTile.id)
        );
        const updatedDeck = [
          ...playerDecks?.[`p${playing as 1 | 2 | 3 | 4}`],
          pulledTile,
        ];
        setPlayerDecks((cr) => ({
          ...cr,
          [`p${playing}`]: updatedDeck,
        }));
        if (checkIsWinning(updatedDeck)) {
          console.info(`${playing}. oyuncu oyunu kazandı!`);
        } else {
          botDiscard(updatedDeck[updatedDeck.length - 2], playing, updatedDeck);
        }
      }
    };
    setTimeout(() => {
      checkCases();
    }, 500);
  };

  const completeTurn = () => {
    setPlaying((cr) => {
      console.info(`${cr === 4 ? 1 : cr + 1}. Oyuncu oynuyor.`);
      return cr === 4 ? 1 : cr + 1;
    });
  };

  const checkIsWinning = (deck: any) => {
    if (deck.length !== 15) {
      console.error("Deck length is not equal to 15");
      return false;
    }
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
            : item.num - 1 === col[index - 1].num ||
              item.num + 1 === col[index - 1].num ||
              (item.num === okey.num && item.colorVariant === okey.colorVariant)
        );
        if (isConsecutive && col.length > 2) currentPoint += col.length;
      } else if (sameNums) {
        const isUniqueColors = col.every((item: any, _, arr) => {
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
    if (currentPoint === 14) {
      return true;
    } else return false;
  };

  const botDiscard = (tile: any, player: number, deck: any) => {
    console.info(`${player}. oyuncu yere attı: `, tile);
    const throwedPlayer =
      player === 4 ? "p4top1" : `p${player}top${player + 1}`;

    const discardedTile = deck?.find((item: any) => item.id === tile?.id);
    setPlayerDecks((cr) => ({
      ...cr,
      [`p${playing}`]: deck.filter((item: any) => item.id !== tile.id),
    }));
    setDiscardedTiles((current: any) => ({
      ...current,
      [throwedPlayer]: [...current[throwedPlayer], discardedTile],
    }));
    completeTurn();
  };

  const checkIsRequiredTile = (deck: any, prevPoint: number) => {
    const groupedDeck = groupDeck(deck);
    const consecutiveCols = groupConsecutiveColumns(groupedDeck);
    let totalPoint = 0;
    consecutiveCols.forEach((item, index) => {
      return item.length > 2 && index !== consecutiveCols.length - 1
        ? (totalPoint += item.length)
        : null;
    });
    if (totalPoint > prevPoint) return true;
    else return false;
  };

  const ThrowedTileDeck = ({ discardedTiles, playerThrown }: any) => {
    const tile =
      discardedTiles?.[playerThrown]?.[
        discardedTiles?.[playerThrown]?.length - 1
      ];
    return (
      <>
        {tile && (
          <div
            id={tile?.id}
            className={`tile color${tile.joker ? 0 : tile.colorVariant}`}
            draggable={
              playerThrown === "p4top1" && playerDecks.p1.length === 14
            }
            onDragStart={playerThrown === "p4top1" ? onDrag : undefined}
          >
            <span className="num" id={`num-${1}`}>
              {tile?.joker ? "★" : tile?.num}
            </span>
            <div className="circle" id={`circle-${1}`}></div>
          </div>
        )}
      </>
    );
  };

  const onFinish = () => {
    if (checkIsWinning(playerDecks.p1)) setWinningStatus(true);
  };

  useEffect(() => {
    if (winningStatus)
      setTimeout(() => {
        setWinningStatus(false);
        setDiscardedTiles({ p1top2: [], p2top3: [], p3top4: [], p4top1: [] });
        distributeTiles();
      }, 15000);
  }, [winningStatus]);

  useEffect(() => {
    if (!gameStatus) {
      distributeTiles();
      setGameStatus(true);
    }
  }, [tileDeck]);

  useEffect(() => {
    if (playing !== 1) {
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
        <div className="board-top">
          <div className="cue-vertical"></div>
          <div
            className="user-area"
            style={{
              height: "unset",
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-around",
            }}
          >
            <div className="dropzone">
              <ThrowedTileDeck
                discardedTiles={discardedTiles}
                playerThrown="p3top4"
              />
            </div>
            <div className={`user ${playing === 3 ? "active" : ""}`}>Ahmet</div>
            <div className="dropzone">
              <ThrowedTileDeck
                discardedTiles={discardedTiles}
                playerThrown="p2top3"
              />
            </div>
          </div>
        </div>
        <div className="mid-section">
          <div className="board-left">
            <div className="cue-horizontal"></div>
            <div className="user-area">
              <div className={`user ${playing === 4 ? "active" : ""}`}>
                Aybek
              </div>
            </div>
          </div>
          <div className="board-middle">
            {/* Okey */}
            <div
              className={`tile color${okey?.colorVariant}`}
              style={{ width: "54px", height: "82px" }}
              onDrop={onFinish}
              onDragOver={allowDrop}
            >
              <span className="num">
                {okey?.num !== 1 ? okey?.num - 1 : 13}
              </span>
              <div className="circle"></div>
            </div>
            {/* Tiles On Ground */}
            <div className={`tile`} style={{ width: "54px", height: "82px" }}>
              <div
                className="num"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
                draggable={playing === 1 && playerDecks.p1.length === 14}
                onDragStart={onDrag}
              >
                {tileDeck?.length}
              </div>
            </div>
          </div>
          <div className="board-right">
            <div className="user-area" style={{ alignItems: "end" }}>
              <div className={`user ${playing === 2 ? "active" : ""}`}>Tan</div>
            </div>
            <div className="cue-horizontal"></div>
          </div>
        </div>

        <div className="board-bottom">
          <div
            className="user-area"
            style={{
              height: "unset",
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-around",
            }}
          >
            <div className="dropzone">
              <ThrowedTileDeck
                discardedTiles={discardedTiles}
                playerThrown="p4top1"
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div className={`user ${playing === 1 ? "active" : ""}`}>
                Oyuncu
              </div>
              <div>
                <button onClick={onAutoSort}>Sort Deck</button>
                <select
                  onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                  value={selectedPlayer}
                  name="player"
                  id=""
                >
                  <option value="1">Player 1</option>
                  <option value="2">Player 2</option>
                  <option value="3">Player 3</option>
                  <option value="4">Player 4</option>
                </select>
              </div>
            </div>
            <div
              className="dropzone"
              style={{ marginBottom: "-200px" }}
              onDrop={discardTile}
              onDragOver={
                playing === 1 && playerDecks?.p1?.length === 15
                  ? allowDrop
                  : undefined
              }
            >
              {discardedTiles.p1top2.length > 0 && (
                <div
                  id={
                    discardedTiles.p1top2[discardedTiles.p1top2.length - 1]?.id
                  }
                  className={`tile color${
                    discardedTiles.p1top2[discardedTiles.p1top2.length - 1]
                      ?.colorVariant
                  }`}
                >
                  <span className="num" id={`num-${1}`}>
                    {
                      discardedTiles.p1top2[discardedTiles.p1top2.length - 1]
                        ?.num
                    }
                  </span>
                  <div className="circle" id={`circle-${1}`}></div>
                </div>
              )}
            </div>
          </div>
          <div className="board-container">
            <div className="tile-container">
              {Array.from({ length: 26 })?.map((_, index: number) => {
                const tile = playerDecks?.[
                  `p${selectedPlayer as 1 | 2 | 3 | 4}`
                ]?.find((tile) => tile.column === index + 1);
                return (
                  <div
                    key={index}
                    id={`slot-${index + 1}`}
                    className="slot"
                    onDrop={onDrop}
                    onDragOver={allowDrop}
                  >
                    {tile && (
                      <div
                        id={`${index + 1}-${tile.id}`}
                        className={`tile color${
                          tile.joker ? 0 : tile.colorVariant
                        }`}
                        draggable
                        onDragStart={onDrag}
                      >
                        <span className="num" id={`num-${index + 1}`}>
                          {tile?.joker ? "★" : tile?.num}
                        </span>
                        <div
                          className="circle"
                          id={`circle-${index + 1}`}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
