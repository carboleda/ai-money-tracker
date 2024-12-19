import { db, Collections } from "@/firebase/server";
import { getMissingFieldsInPrompt } from "@/config/utils";
import { NextRequest, NextResponse } from "next/server";
import {
  GeneratedTransaction,
  Transaction,
  TransactionEntity,
  TransactionStatus,
} from "@/interfaces/transaction";
import { Timestamp, UpdateData } from "firebase-admin/firestore";
import { EventTypes, EventBus } from "../event-bus";
import "@/app/api/accounts/events";
import { extractData } from "@/genai";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get("text")?.toString();
  const picture = formData.get("picture")?.toString();
  const createdAtManual = formData.get("createdAt")?.toString();
  const sourceAccount = formData.get("sourceAccount")?.toString();

  if (!text && !picture) {
    return new NextResponse(null, {
      status: 400,
      statusText: "Either description or picture is required",
    });
  }

  if (text) {
    const missingFields = getMissingFieldsInPrompt(text);

    if (missingFields.length > 0) {
      return new NextResponse(null, { status: 400 });
    }
  }

  const generatedResponse = await extractData(text, picture);

  if (!generatedResponse || generatedResponse?.error) {
    return new NextResponse(null, {
      status: 400,
      statusText: generatedResponse?.error ?? "Invalid transaction",
    });
  }

  const generatedTransaction =
    generatedResponse as GeneratedTransaction.TransactionData;
  console.log("POST -> generatedTransaction", { generatedTransaction });

  const transactionData = {
    ...generatedTransaction,
    sourceAccount: sourceAccount
      ? sourceAccount
      : generatedTransaction.sourceAccount,
    createdAt: getProperCreatedAtDate(
      createdAtManual,
      generatedTransaction.createdAt
    ),
    status: TransactionStatus.COMPLETE,
  } as Omit<TransactionEntity, "id">;

  const docRef = await db
    .collection(Collections.Transactions)
    .add(transactionData);

  await EventBus.publish(EventTypes.TRANSACTION_CREATED, transactionData);

  return NextResponse.json({ id: docRef.id });
}

export async function PUT(req: NextRequest) {
  const { id, ...transactionData } = (await req.json()) as Transaction;
  const newTransaction = {
    ...transactionData,
    createdAt: Timestamp.fromDate(new Date(transactionData.createdAt)),
  } as TransactionEntity;

  const doc = db.collection(Collections.Transactions).doc(id);
  const oldTransaction = (await doc.get()).data() as TransactionEntity;

  doc.update(newTransaction as UpdateData<TransactionEntity>);

  await EventBus.publish<TransactionEntity>(EventTypes.TRANSACTION_UPDATED, {
    oldData: oldTransaction,
    newData: newTransaction,
  });

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  try {
    const id = await req.text();
    console.log("DELETE -> id", { id });

    const doc = db.collection(Collections.Transactions).doc(id);
    const transaction = (await doc.get()).data() as TransactionEntity;

    await EventBus.publish(EventTypes.TRANSACTION_DELETED, transaction);

    await doc.delete();
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

const getProperCreatedAtDate = (
  createdAtManual?: string,
  createdAtGenerated?: string
) => {
  if (createdAtManual) {
    return Timestamp.fromDate(new Date(createdAtManual));
  }

  if (createdAtGenerated) {
    return Timestamp.fromDate(new Date(createdAtGenerated));
  }

  return Timestamp.fromDate(new Date());
};
