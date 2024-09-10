import { Collections, db } from "@/config/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const collectionRef = db.collection(Collections.RecurringExpenses);

  const q = collectionRef.orderBy("frequency", "asc");

  const snapshot = await q.get();
  const recurringExpensesConfig = snapshot.docs.map((doc) => {
    const docData = doc.data();
    return {
      ...docData,
      id: doc.id,
    };
  });

  return NextResponse.json({ recurringExpensesConfig });
}

export async function POST(req: NextRequest) {
  const recurringExpenseConfig = await req.json();

  const docRef = await db
    .collection(Collections.RecurringExpenses)
    .add(recurringExpenseConfig);

  return NextResponse.json({ id: docRef.id });
}

export async function PATCH(req: NextRequest) {
  const { id, ...recurringExpenseConfig } = await req.json();

  await db
    .collection(Collections.RecurringExpenses)
    .doc(id)
    .update(recurringExpenseConfig);

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
