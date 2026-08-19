import { Skeleton } from "@heroui/react";

export type Tile = {
  title: string;
  data: React.ReactNode;
  className?: string;
};

export interface TilesProps {
  tiles: Tile[];
}

export const Tiles: React.FC<TilesProps> = ({ tiles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row items-start gap-4">
      {tiles.map((tile, index) => (
        <div
          key={`${tile.title}-${index}`}
          className={`w-full flex flex-row flex-wrap justify-start ${tile.className}`}
        >
          <span className="subtitle text-lg font-bold my-2">{tile.title}</span>
          {tile.data ?? <Skeleton className="h-40 rounded-lg w-full" />}
        </div>
      ))}
    </div>
  );
};
