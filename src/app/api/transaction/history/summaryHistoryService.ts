import { FilterTransactionsShareFunctions } from "@/app/api/transaction/[status]/functions";
import { Collections, db } from "@/firebase/server";
import { SummaryShareFunctions } from "@/app/api/summary/functions";
import { TransactionStatus, TransactionType } from "@/interfaces/transaction";
import { getMonthBounds } from "@/config/utils";
import {
  TransactionsSummaryHistory,
  TransactionsSummaryHistoryEntity,
} from "@/interfaces/account";
import { Timestamp } from "firebase-admin/firestore";

export class SummaryHistoryService {
  static async saveEntryForLastMonth() {
    const previousMonth = new Date();
    previousMonth.setDate(previousMonth.getDate() - 1);
    const bounds = getMonthBounds(previousMonth);

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

    db.collection(Collections.TransactionsSummaryHistory).add({
      incomes: valueGetter(TransactionType.INCOME),
      expenses: valueGetter(TransactionType.EXPENSE),
      transfers: valueGetter(TransactionType.TRANSFER),
      createdAt: Timestamp.fromDate(bounds.end),
    } as TransactionsSummaryHistoryEntity);
  }

  static async getLastTwelveMonthsHistory() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(15);

    const query = db
      .collection(Collections.TransactionsSummaryHistory)
      .where("createdAt", ">=", Timestamp.fromDate(twelveMonthsAgo))
      .orderBy("createdAt", "asc");

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => {
      const docData = { ...doc.data() } as TransactionsSummaryHistoryEntity;
      return {
        ...docData,
        id: doc.id,
        createdAt: docData.createdAt.toDate().toISOString(),
      } as TransactionsSummaryHistory;
    });
  }

  private static getValueForType(
    transactionsByType: { type: string; total: number }[]
  ) {
    return (type: TransactionType) => {
      return transactionsByType.find((t) => t.type === type)?.total || 0;
    };
  }
}