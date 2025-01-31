import { getTransactionOverdueStatus } from "@/config/utils";
import { TransactionOverdueStatus } from "@/interfaces/transaction";
import { Chip, ChipProps } from "@heroui/chip";
import React, { PropsWithChildren } from "react";

interface DueDateIndicatorProps extends PropsWithChildren {
  dueDate: string;
}

const statusColorMap: Record<TransactionOverdueStatus, ChipProps["color"]> = {
  [TransactionOverdueStatus.OVERDUE]: "danger",
  [TransactionOverdueStatus.SOON]: "warning",
  [TransactionOverdueStatus.UPCOMING]: "success",
};

export const DueDateIndicator: React.FC<DueDateIndicatorProps> = ({
  children,
  dueDate,
}) => {
  const status = getTransactionOverdueStatus(dueDate);
  return (
    <Chip
      className="border-none p-0"
      color={statusColorMap[status]}
      size="sm"
      variant="dot"
    >
      {children}
    </Chip>
  );
};
