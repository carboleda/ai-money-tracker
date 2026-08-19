import { PropsWithChildren } from "react";
import { Chip, ChipProps, Skeleton } from "@heroui/react";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

type TransactionTypeDecoratorProps = (
  | {
      type: TransactionType;
      color?: never; // Explicitly disallow color
    }
  | {
      type?: never; // Explicitly disallow type
      color: ChipProps["color"];
    }
) &
  PropsWithChildren<{
    size?: "sm" | "md" | "lg";
    avatar?: React.ReactNode;
    disabled?: boolean;
  }>;

const colorMapper: Record<TransactionType, ChipProps["color"]> = {
  [TransactionType.INCOME]: "success",
  [TransactionType.EXPENSE]: "danger",
  [TransactionType.TRANSFER]: "warning",
};

export const TransactionTypeDecorator: React.FC<
  TransactionTypeDecoratorProps
> = ({ type, color, size, avatar, disabled, children }) => {
  if (!children) {
    return <Skeleton className="w-20 h-5 rounded-md" />;
  }

  return (
    <Chip
      className="rounded-sm"
      variant="tertiary"
      size={size}
      color={color ?? colorMapper[type!]}
      isDisabled={disabled ?? false}
    >
      {avatar}
      {children}
    </Chip>
  );
};
