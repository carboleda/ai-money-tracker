import { Skeleton } from "@nextui-org/skeleton";

export const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-5 rounded-large p-4 bg-zinc-900">
      <Skeleton className="rounded-lg">
        <div className="h-10 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="rounded-lg">
          <div className="h-6 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className=" rounded-lg">
          <div className="h-6 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-6 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </div>
  );
};
