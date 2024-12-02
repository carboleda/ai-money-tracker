import { getAccountName } from "@/config/utils";
import { Collections, db } from "@/firebase/server";
import {
  Transaction,
  TransactionEntity,
  TransactionStatus,
} from "@/interfaces/transaction";
import { Filter } from "firebase-admin/firestore";

interface FilterParams {
  status: TransactionStatus;
  account?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export class FilterTransactionsShareFunctions {
  static async searchTransactions(
    params: FilterParams
  ): Promise<Transaction[]> {
    const { status, account, startDate, endDate } = params;

    const collectionRef = db.collection(Collections.Transactions);
    let q = collectionRef.orderBy(
      "createdAt",
      status === TransactionStatus.PENDING ? "asc" : "desc"
    );

    if (startDate && endDate) {
      q = q
        .where("createdAt", ">=", startDate!)
        .where("createdAt", "<=", endDate!);
    }

    if (account) {
      q = q.where(
        Filter.and(
          Filter.or(
            Filter.where("sourceAccount", "==", account),
            Filter.where("destinationAccount", "==", account)
          )
        )
      );
    }

    const snapshot = await q.get();
    return snapshot.docs.map((doc) => {
      const docData = { ...doc.data() } as TransactionEntity;
      return {
        ...docData,
        id: doc.id,
        sourceAccount: getAccountName(docData.sourceAccount),
        destinationAccount:
          docData.destinationAccount &&
          getAccountName(docData.destinationAccount),
        createdAt: docData.createdAt.toDate().toISOString(),
      } as Transaction;
    });
  }
}
