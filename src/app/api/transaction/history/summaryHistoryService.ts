import { FilterTransactionsShareFunctions } from "@/app/api/transaction/[status]/functions";
import { Collections, db } from "@/firebase/server";
import { SummaryShareFunctions } from "@/app/api/summary/functions";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { getMonthBounds, getPreviousMonth } from "@/config/utils";
import {
  TransactionsSummaryHistory,
  TransactionsSummaryHistoryEntity,
} from "@/interfaces/account";
import { Timestamp } from "firebase-admin/firestore";

export class SummaryHistoryService {
  static async saveEntryForLastMonth() {
    const now = new Date();

    // Only run on the 2nd of the month
    // TODO Define a constant for the day
    if (now.getDate() !== 2) {
      return;
    }

    const previousMonth = getPreviousMonth(now);
    const bounds = getMonthBounds(previousMonth);
    // const bounds = getMonthBounds(new Date(2024, 11, 1));

    const transactions =
      await FilterTransactionsShareFunctions.searchTransactions({
        status: TransactionStatus.COMPLETE,
        startDate: bounds.start,
        endDate: bounds.end,
      });

    const transactionsByType =
      SummaryShareFunctions.getSummaryByType(transactions);

    const valueGetter =
      SummaryHistoryService.getValueForType(transactionsByType);

    // console.log({
    //   incomes: valueGetter(TransactionType.INCOME),
    //   expenses: valueGetter(TransactionType.EXPENSE),
    //   transfers: valueGetter(TransactionType.TRANSFER),
    //   createdAt: bounds.end,
    // });

    db.collection(Collections.TransactionsSummaryHistory).add({
      incomes: valueGetter(TransactionType.INCOME),
      expenses: valueGetter(TransactionType.EXPENSE),
      transfers: valueGetter(TransactionType.TRANSFER),
      createdAt: Timestamp.fromDate(bounds.end),
    } as TransactionsSummaryHistoryEntity);
  }

  static async getLastTwelveMonthsHistory(transactions: Transaction[]) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(15);

    const query = db
      .collection(Collections.TransactionsSummaryHistory)
      .where("createdAt", ">=", Timestamp.fromDate(twelveMonthsAgo))
      .orderBy("createdAt", "asc");

    const snapshot = await query.get();

    const history = snapshot.docs.map((doc) => {
      const docData = { ...doc.data() } as TransactionsSummaryHistoryEntity;
      return {
        ...docData,
        id: doc.id,
        createdAt: docData.createdAt.toDate().toISOString(),
      } as TransactionsSummaryHistory;
    });

    history.push(
      await SummaryHistoryService.getExpensesForCurrentMonth(transactions)
    );

    return history;
  }

  private static getValueForType(
    transactionsByType: { type: string; total: number }[]
  ) {
    return (type: TransactionType) => {
      return transactionsByType.find((t) => t.type === type)?.total || 0;
    };
  }

  private static async getExpensesForCurrentMonth(
    transactions: Transaction[]
  ): Promise<TransactionsSummaryHistory> {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalTransfers = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING) {
        return;
      }

      if (transaction.type == TransactionType.INCOME) {
        totalIncomes += transaction.amount;
      } else if (transaction.type == TransactionType.TRANSFER) {
        totalTransfers += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    return {
      id: "current",
      incomes: totalIncomes,
      expenses: totalExpenses,
      transfers: totalTransfers,
      createdAt: new Date().toISOString(),
    };
  }
}
