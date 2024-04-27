import { TransactionType } from "@/interfaces/transaction";
import { ReactNode } from "react";
import { Code } from "@nextui-org/code";

interface TransactionTypeProps {
  type: TransactionType;
  children: ReactNode;
}

export const TransactionTypeDecorator: React.FC<TransactionTypeProps> = ({
  type,
  children,
}) => {
  if (type === TransactionType.INCOME)
    return <Code color="success">{children}</Code>;
  if (type === TransactionType.EXPENSE)
    return <Code color="danger">{children}</Code>;
  if (type === TransactionType.TRANSFER)
    return <Code color="warning">{children}</Code>;
};
