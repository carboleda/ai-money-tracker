import {
  Summary,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";

export class SummaryShareFunctions {
  static computeSummary(transactions: Transaction[]): Summary {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalPending = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING) {
        totalPending += transaction.amount;
        return;
      }

      if (transaction.type == TransactionType.INCOME) {
        totalIncomes += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    const totalBalance = totalIncomes - totalExpenses;

    return {
      totalIncomes,
      totalExpenses,
      totalPending,
      totalBalance,
    };
  }
}
