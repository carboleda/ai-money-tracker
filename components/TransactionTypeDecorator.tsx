import { TransactionType } from "@/interfaces/transaction";
import { ReactNode } from "react";
import { Chip } from "@nextui-org/chip";

interface TransactionTypeDecoratorProps {
  type: TransactionType;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const TransactionTypeDecorator: React.FC<
  TransactionTypeDecoratorProps
> = ({ type, size, children }) => {
  if (type === TransactionType.INCOME)
    return (
      <Chip color="success" variant="flat" size={size}>
        {children}
      </Chip>
    );
  if (type === TransactionType.EXPENSE)
    return (
      <Chip color="danger" variant="flat" size={size}>
        {children}
      </Chip>
    );
  if (type === TransactionType.TRANSFER)
    return (
      <Chip color="warning" variant="flat" size={size}>
        {children}
      </Chip>
    );

  return <></>;
};
