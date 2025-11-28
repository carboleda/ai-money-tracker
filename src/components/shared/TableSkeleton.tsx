import { Skeleton } from "@heroui/skeleton";

export const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-5 rounded-large p-4 bg-slate-100 dark:bg-zinc-900">
      {renderRow("h-10")}
      <div className="space-y-3">
        {renderRow("h-16")}
        {renderRow("h-16")}
        {renderRow("h-16")}
      </div>
    </div>
  );
};

function renderRow(height: string = "h-6") {
  return (
    <div className="flex flex-row gap-3">
      <Skeleton className="rounded-lg w-full">
        <div className={`${height} rounded-lg bg-default-200`}></div>
      </Skeleton>
      {/* <Skeleton className="rounded-lg w-3/4">
        <div className={`${height} rounded-lg bg-default-200`}></div>
      </Skeleton>
      <Skeleton className="rounded-lg w-1/3">
        <div className={`${height} rounded-lg bg-default-200`}></div>
      </Skeleton>
      <Skeleton className="rounded-lg w-1/3">
        <div className={`${height} rounded-lg bg-default-200`}></div>
      </Skeleton> */}
    </div>
  );
}
