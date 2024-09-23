import { Collections, db } from "@/firebase/server";
import {
  RecurringExpense,
  RecurringExpenseEntity,
} from "@/interfaces/recurringExpense";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const collectionRef = db.collection(Collections.RecurringExpenses);

  const q = collectionRef.orderBy("frequency", "asc");

  const snapshot = await q.get();
  const recurringExpensesConfig = snapshot.docs.map((doc) => {
    const docData = doc.data() as RecurringExpenseEntity;
    return {
      ...docData,
      id: doc.id,
      dueDate: docData.dueDate.toDate().toISOString(),
    };
  });

  return NextResponse.json({ recurringExpensesConfig });
}

export async function POST(req: NextRequest) {
  const recurringExpense = (await req.json()) as RecurringExpense;

  const docRef = await db.collection(Collections.RecurringExpenses).add({
    ...recurringExpense,
    dueDate: Timestamp.fromDate(new Date(recurringExpense.dueDate)),
  } as RecurringExpenseEntity);

  return NextResponse.json({ id: docRef.id });
}

export async function PUT(req: NextRequest) {
  const { id, ...recurringExpense } = (await req.json()) as RecurringExpense;

  await db
    .collection(Collections.RecurringExpenses)
    .doc(id)
    .update({
      ...recurringExpense,
      dueDate: Timestamp.fromDate(new Date(recurringExpense.dueDate)),
    });

  return NextResponse.json({ id });
}

export async function DELETE(req: Request) {
  try {
    const id = await req.text();
    await db.collection(Collections.RecurringExpenses).doc(id).delete();
    return new NextResponse(null, {
      status: 204,
      statusText: "Document successfully deleted!",
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, {
      status: 500,
      statusText: `Error removing document ${error}`,
    });
  }
}
