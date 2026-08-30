import { getTransactionOverdueStatus } from "@/config/utils";
import { TransactionOverdueStatus } from "@/interfaces/transaction";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";

interface DueDateIndicatorProps extends PropsWithChildren {
  dueDate: string;
}

const statusDotColorMap: Record<TransactionOverdueStatus, string> = {
  [TransactionOverdueStatus.OVERDUE]: "bg-danger",
  [TransactionOverdueStatus.SOON]: "bg-warning",
  [TransactionOverdueStatus.UPCOMING]: "bg-success",
};

export const DueDateIndicator: React.FC<DueDateIndicatorProps> = ({
  children,
  dueDate,
}) => {
  const status = getTransactionOverdueStatus(dueDate);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className={clsx(
          "inline-block h-2 w-2 rounded-full",
          statusDotColorMap[status]
        )}
      />
      {children}
    </span>
  );
};
