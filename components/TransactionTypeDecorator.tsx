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
      <Chip radius="sm" color="success" variant="flat" size={size}>
        {children}
      </Chip>
    );
  if (type === TransactionType.EXPENSE)
    return (
      <Chip radius="sm" color="danger" variant="flat" size={size}>
        {children}
      </Chip>
    );
  if (type === TransactionType.TRANSFER)
    return (
      <Chip radius="sm" color="warning" variant="flat" size={size}>
        {children}
      </Chip>
    );

  return <></>;
};
