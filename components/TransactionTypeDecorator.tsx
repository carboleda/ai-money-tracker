import { TransactionType } from "@/interfaces/transaction";
import { PropsWithChildren } from "react";
import { Chip, ChipProps } from "@nextui-org/chip";
import { Skeleton } from "@nextui-org/skeleton";

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
    >
      {children}
    </Chip>
  );
};
