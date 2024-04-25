import { TransactionType } from "@/interfaces/transaction";
import { IconArrowDown, IconArrowUp, IconArrowsExchangeAltV } from "./icons";

interface TransactionTypeProps {
  type: TransactionType;
}

export const TransactionTypeIcon: React.FC<TransactionTypeProps> = ({
  type,
}) => {
  if (type === TransactionType.INCOME)
    return <IconArrowUp className="text-green-500" />;
  if (type === TransactionType.EXPENSE)
    return <IconArrowDown className="text-red-500" />;
  if (type === TransactionType.TRANSFER)
    return <IconArrowsExchangeAltV className="text-orange-500" />;
};
