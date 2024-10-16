import { Collections, db } from "@/firebase/server";
import { getAccountName } from "@/config/utils";
import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  Transaction,
  TransactionEntity,
  TransactionStatus,
} from "@/interfaces/transaction";

type GetTransactionsParams = { params: { status: TransactionStatus } };

export async function GET(req: NextRequest, { params }: GetTransactionsParams) {
  const searchParams = req.nextUrl.searchParams;
  const account = searchParams.get("acc");
  const collectionRef = db.collection(Collections.Transactions);

  let q = collectionRef
    .where("status", "==", params.status)
    .orderBy(
      "createdAt",
      params.status === TransactionStatus.PENDING ? "asc" : "desc"
    );

  if (account) {
    q = q.where("sourceAccount", "==", account);
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

  return NextResponse.json({ accounts: Env.VALID_ACCOUNTS, transactions });
}
