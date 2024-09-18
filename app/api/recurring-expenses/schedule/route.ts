import * as env from "@/config/env";
import { Collections, db } from "@/firebase/server";
import { computeBiannualDates } from "@/config/utils";
import {
  Frequency,
  RecurringExpense,
  RecurringExpenseEntity,
} from "@/interfaces/recurringExpense";
import {
  PendingTransactionEntity,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  console.log(!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`);

  if (
    !env.isDev &&
    (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`)
  ) {
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 401,
    });
  }

  const recurringExpenses: RecurringExpense[] = await getRecurringExpenses();
  const createdTransactions: PendingTransactionEntity[] = [];

  for await (const recurringExpense of recurringExpenses) {
    const createdAt = getTransactionDate(recurringExpense);

    if (!createdAt) {
      continue;
    }

    console.log(
      `Creating pending transaction for ${recurringExpense.description}`
    );
    const transaction: PendingTransactionEntity = {
      type: TransactionType.EXPENSE,
      status: TransactionStatus.PENDING,
      description: recurringExpense.description,
      category: recurringExpense.category,
      amount: recurringExpense.amount,
      createdAt: Timestamp.fromDate(createdAt),
    };

    createdTransactions.push(transaction);
    await db.collection(Collections.Transactions).add(transaction);
  }

  return new NextResponse(null, { status: 200 });
}

async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const recurringExpenses = db.collection(Collections.RecurringExpenses);
  const snapshot = await recurringExpenses.get();

  return snapshot.docs.map((doc) => {
    const docData = doc.data() as RecurringExpenseEntity;
    return {
      id: doc.id,
      amount: docData.amount,
      category: docData.category,
      description: docData.description,
      frequency: docData.frequency,
      dueDate: docData.dueDate.toDate().toISOString(),
    } as RecurringExpense;
  });
}

function getTransactionDate(recurringExpense: RecurringExpense): Date | null {
  const now = new Date();
  const dueDate = new Date(recurringExpense.dueDate);
  let createdAt = new Date(recurringExpense.dueDate);

  if (
    now.getMonth() === dueDate.getMonth() &&
    [Frequency.Yearly, Frequency.Monthly].includes(recurringExpense.frequency)
  ) {
    createdAt.setFullYear(now.getFullYear());

    return createdAt;
  }

  if (recurringExpense.frequency === Frequency.Biannual) {
    const dates = computeBiannualDates(dueDate);
    const dateIndex = dates.findIndex(
      (date) => date.getMonth() === now.getMonth()
    );

    if (dateIndex !== -1) {
      createdAt = dates[dateIndex];
      createdAt.setFullYear(now.getFullYear());

      return createdAt;
    }
  }

  return null;
}
