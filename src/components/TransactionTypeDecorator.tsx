import { TransactionType } from "@/interfaces/transaction";
import { PropsWithChildren } from "react";
import { Chip, ChipProps } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

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

export const TransactionTypeDecorator: React.FC<TransactionTypeDecoratorProps> = ({
  type,
  color,
  size,
  avatar,
  disabled,
  children,
}) => {
  if (!children) {
    return <Skeleton className="w-20 h-5 rounded-md" />;
  }

  return (
    <Chip
      radius="sm"
      variant="flat"
      size={size}
      avatar={avatar}
      color={color ?? colorMapper[type!]}
      isDisabled={disabled ?? false}
    >
      {children}
    </Chip>
  );
};
