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
import "@/app/api/accounts/functions";
import { extractData } from "@/genai";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get("text")?.toString();
  const picture = formData.get("picture")?.toString();
  const createdAt = formData.get("createdAt")?.toString();

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

  const trasactionJson = await extractData(text, picture);

  if (!trasactionJson || trasactionJson?.error) {
    return new NextResponse(null, {
      status: 400,
      statusText: trasactionJson?.error ?? "Invalid transaction",
    });
  }

  const transactionData = {
    ...(trasactionJson as GeneratedTransaction.TransactionData),
    status: TransactionStatus.COMPLETE,
    createdAt: createdAt
      ? Timestamp.fromDate(new Date(createdAt))
      : Timestamp.fromDate(new Date()),
  } as Omit<TransactionEntity, "id">;

  const docRef = await db
    .collection(Collections.Transactions)
    .add(transactionData);

  await EventBus.publish(EventTypes.TRANSACTION_CREATED, transactionData);

  return NextResponse.json({ id: docRef.id });
}

export async function PUT(req: NextRequest) {
  const { id, ...transactionData } = (await req.json()) as Transaction;
  const entity = {
    ...transactionData,
    createdAt: Timestamp.fromDate(new Date(transactionData.createdAt)),
  } as TransactionEntity;

  await db
    .collection(Collections.Transactions)
    .doc(id)
    .update(entity as UpdateData<TransactionEntity>);

  await EventBus.publish(EventTypes.TRANSACTION_CREATED, entity);

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  try {
    const id = await req.text();

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
