import { TransactionType } from "@/interfaces/transaction";
import {
  IconArrowDownCircleFill,
  IconArrowUpCircleFill,
  IconMoneyBillTransfer,
} from "./shared/icons";

interface TransactionTypeProps {
  type: TransactionType;
}

export const TransactionTypeIcon: React.FC<TransactionTypeProps> = ({
  type,
}) => {
  if (type === TransactionType.INCOME)
    return <IconArrowUpCircleFill className="text-green-500" />;
  if (type === TransactionType.EXPENSE)
    return <IconArrowDownCircleFill className="text-red-500" />;
  if (type === TransactionType.TRANSFER)
    return <IconMoneyBillTransfer className="text-orange-500" />;
};
