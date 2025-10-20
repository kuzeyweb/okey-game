import { debugLog } from "../config/debug";

/**
 * TileCard Component
 *
 * A reusable component for displaying individual tiles in the Okey game.
 * Shows tile number or joker symbol with appropriate color styling.
 *
 * This component is used throughout the game for consistent tile rendering.
 */

enum colorVariants {
  A = 1,
  B = 2,
  C = 3,
  D = 3,
}

interface Tile {
  id: string;
  num: number;
  colorVariant: colorVariants;
  joker: boolean;
}

const TileCard = ({ data }: { data: Tile }) => {
  debugLog("TILE_CARD", "Rendering tile card", {
    tileId: data?.id,
    tileNumber: data?.num,
    isJoker: data?.joker,
    colorVariant: data?.colorVariant,
  });

  return (
    <div
      id={data?.id}
      className={`tile color${data.joker ? 0 : data.colorVariant}`}
    >
      <span className="num" id={`num-${1}`}>
        {data?.joker ? "★" : data?.num}
      </span>
      <div className="circle" id={`circle-${1}`}></div>
    </div>
  );
};

export default TileCard;
