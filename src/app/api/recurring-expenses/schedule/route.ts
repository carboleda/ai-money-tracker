import { Env } from "@/config/env";
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

  if (
    !Env.isLocal &&
    (!Env.CRON_SECRET || authHeader !== `Bearer ${Env.CRON_SECRET}`)
  ) {
    console.error("Unauthorized request");
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 401,
    });
  }

  return scheduleRecurringExpenses();
}

async function scheduleRecurringExpenses() {
  console.log(`Fetching recurring expenses...`);
  const recurringExpenses: RecurringExpense[] = await getRecurringExpenses();

  if (!recurringExpenses.length) {
    console.log("No recurring expenses found.");
    return new NextResponse(null, { status: 200 });
  }
  console.log(`Found ${recurringExpenses.length} recurring expenses`);

  for await (const recurringExpense of recurringExpenses) {
    if (recurringExpense.disabled) {
      console.log(
        `Skipping transaction for ${recurringExpense.description} as it's disabled`
      );
      continue;
    }

    const createdAt = getTransactionDate(recurringExpense);

    if (!createdAt) {
      console.log(
        `Skipping transaction for ${recurringExpense.description} createdAt is "${createdAt}"`
      );
      continue;
    }

    console.log(
      `Creating pending transaction for ${recurringExpense.description}`
    );
    const transaction: PendingTransactionEntity = {
      id: recurringExpense.id,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.PENDING,
      description: recurringExpense.description,
      category: recurringExpense.category,
      amount: recurringExpense.amount,
      createdAt: Timestamp.fromDate(createdAt),
      paymentLink: recurringExpense.paymentLink,
      notes: recurringExpense.notes,
    };

    await db.collection(Collections.Transactions).add(transaction);
  }

  return new NextResponse(null, { status: 200 });
}

async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const recurringExpenses = db.collection(Collections.RecurringExpenses);
  const snapshot = await recurringExpenses.get();

  return snapshot.docs.map((doc) => {
    const docData = { id: doc.id, ...doc.data() } as RecurringExpenseEntity;
    return {
      ...docData,
      // amount: docData.amount,
      // category: docData.category,
      // description: docData.description,
      // frequency: docData.frequency,
      // paymentLink: docData.paymentLink,
      // notes: docData.notes,
      dueDate: docData.dueDate.toDate().toISOString(),
      disabled: docData.disabled ?? false,
    } as RecurringExpense;
  });
}

/**
 * The function determines the transaction date based on the frequency of the recurring expense:
 * - Firsy it chackes if it's monthly frequency or yearly frequency.
 *   For yearly it checks if the current month matches the due date's month and for any of the cases
 *   it returns the due date with the current year and moth.
 * - For biannual frequency, it computes potential biannual dates and checks if any of them
 *   match the current month, returning the matching date with the current year.
 * - If no conditions are met, it returns null.
 * @param recurringExpense
 * @returns
 */
function getTransactionDate(recurringExpense: RecurringExpense): Date | null {
  const now = new Date();
  const dueDate = new Date(recurringExpense.dueDate);
  let createdAt = new Date(recurringExpense.dueDate);

  if (
    recurringExpense.frequency === Frequency.Monthly ||
    (recurringExpense.frequency === Frequency.Yearly &&
      now.getMonth() === dueDate.getMonth())
  ) {
    createdAt.setFullYear(now.getFullYear());
    createdAt.setMonth(now.getMonth());

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
