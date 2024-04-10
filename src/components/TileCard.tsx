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
