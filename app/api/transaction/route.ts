import { db, Collections } from "@/firebase/server";
import { genAIModel } from "@/config/genAI";
import { getMissingFieldsInPrompt } from "@/config/utils";
import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  Transaction,
  TransactionEntity,
  TransactionStatus,
} from "@/interfaces/transaction";
import { Timestamp, UpdateData } from "firebase-admin/firestore";
import { apiEventBus, EventTypes } from "../event-bus";

export async function POST(req: NextRequest) {
  const trasactionText = await req.text();
  const missingFields = getMissingFieldsInPrompt(trasactionText);

  if (missingFields.length > 0) {
    return new NextResponse(null, { status: 400 });
  }

  const trasactionJson = await generateTransactionJson(trasactionText);

  const transactionData = {
    ...trasactionJson,
    status: TransactionStatus.COMPLETE,
    createdAt: Timestamp.fromDate(new Date()),
  } as TransactionEntity;

  const docRef = await db
    .collection(Collections.Transactions)
    .add(transactionData);

  apiEventBus.emit(EventTypes.TRANSACTION_CREATED, transactionData);

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

  apiEventBus.emit(EventTypes.TRANSACTION_CREATED, entity);

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  try {
    const id = await req.text();

    const doc = db.collection(Collections.Transactions).doc(id);
    const transaction = (await doc.get()).data() as TransactionEntity;

    apiEventBus.emit(EventTypes.TRANSACTION_DELETED, transaction);

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

async function generateTransactionJson(text: string) {
  const prompt = `${Env.PROMPT_TEMPLATE} ${text}`;

  console.log("propmt", prompt);
  const result = await genAIModel.generateContent(prompt);
  const responseText = result.response.text();
  console.log("result", responseText);
  const aiData = JSON.parse(responseText.replace(/\```(json)?/g, ""));
  console.log("aiData", aiData);

  return aiData;
}
