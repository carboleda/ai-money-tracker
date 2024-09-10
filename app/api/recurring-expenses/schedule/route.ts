import { Collections, db } from "@/config/firestore";
import { computeBiannualDates } from "@/config/utils";
import {
  Frequency,
  RecurringExpenseConfig,
} from "@/interfaces/recurringExpense";
import {
  RecurringExpenseTransaction,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 401,
    });
  }

  const recurringExpenses = await getRecurringExpenses();
  const createdTransactions: RecurringExpenseTransaction[] = [];

  for await (const recurringExpense of recurringExpenses) {
    const createdAt = getTransactionDate(recurringExpense);

    if (!createdAt) {
      continue;
    }

    console.log(
      `Creating pending transaction for ${recurringExpense.description}`
    );
    const transaction: RecurringExpenseTransaction = {
      type: TransactionType.EXPENSE,
      status: TransactionStatus.PENDING,
      description: recurringExpense.description,
      category: recurringExpense.category,
      amount: recurringExpense.amount,
      createdAt: createdAt.toISOString(),
    };

    createdTransactions.push(transaction);
    await db.collection(Collections.Transactions).add(transaction);
  }

  return NextResponse.json({ createdTransactions });
}

async function getRecurringExpenses(): Promise<RecurringExpenseConfig[]> {
  const recurringExpenses = db.collection(Collections.RecurringExpenses);
  const snapshot = await recurringExpenses.get();

  return snapshot.docs.map((doc) => {
    const docData = doc.data();
    return {
      id: doc.id,
      amount: docData.amount,
      category: docData.category,
      description: docData.description,
      dueDate: docData.dueDate,
      frequency: docData.frequency,
    };
  });
}

function getTransactionDate(
  recurringExpense: RecurringExpenseConfig
): Date | null {
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
