import { Collections, db } from "@/firebase/server";
import { getAccountName } from "@/config/utils";
import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  GetTransactionsResponse,
  Summary,
  Transaction,
  TransactionEntity,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { Filter } from "firebase-admin/firestore";

type GetTransactionsParams = { params: { status: TransactionStatus } };

export async function GET(req: NextRequest, { params }: GetTransactionsParams) {
  const searchParams = req.nextUrl.searchParams;
  const account = searchParams.get("acc");
  const collectionRef = db.collection(Collections.Transactions);

  let q = collectionRef.orderBy(
    "createdAt",
    params.status === TransactionStatus.PENDING ? "asc" : "desc"
  );

  if (searchParams.has("start") && searchParams.has("end")) {
    q = q
      .where("createdAt", ">=", new Date(searchParams.get("start")!))
      .where("createdAt", "<=", new Date(searchParams.get("end")!));
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
  const transactions = snapshot.docs.map((doc) => {
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

  const summary = computeSummary(transactions);

  return NextResponse.json({
    accounts: Env.VALID_ACCOUNTS,
    transactions: transactions.filter(
      (transaction) => transaction.status === params.status
    ),
    summary,
  } as GetTransactionsResponse);
}

function computeSummary(transactions: Transaction[]): Summary {
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