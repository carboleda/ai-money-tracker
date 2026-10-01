import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

export const CHIP_EXPENSE_AMOUNT_CLASS =
  "text-danger-soft-foreground! font-semibold";
export const CHIP_INCOME_AMOUNT_CLASS = "text-success font-semibold";
export const CHIP_TRANSFER_AMOUNT_CLASS = "text-warning font-semibold";

export const getAmountColorClass = (type: TransactionType) => {
  switch (type) {
    case TransactionType.EXPENSE:
      return CHIP_EXPENSE_AMOUNT_CLASS;
    case TransactionType.INCOME:
      return CHIP_INCOME_AMOUNT_CLASS;
    case TransactionType.TRANSFER:
      return CHIP_TRANSFER_AMOUNT_CLASS;
    default:
      return "";
  }
};

export const getAmountSign = (type: TransactionType): "" | "-" =>
  type === TransactionType.EXPENSE ? "-" : "";
