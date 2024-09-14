import { Collections, db } from "@/firebase/server";
import { genAIModel } from "@/config/genAI";
import { getMissingFieldsInPrompt } from "@/config/utils";
import * as env from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  Transaction,
  TransactionEntity,
  TransactionStatus,
} from "@/interfaces/transaction";
import { Timestamp } from "firebase-admin/firestore";

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

  return NextResponse.json({ id: docRef.id });
}

export async function PUT(req: NextRequest) {
  const { id, ...transactionData } = (await req.json()) as Transaction;

  await db
    .collection(Collections.Transactions)
    .doc(id)
    .update({
      ...transactionData,
      createdAt: Timestamp.fromDate(new Date(transactionData.createdAt)),
    });

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  try {
    const id = await req.text();
    await db.collection(Collections.Transactions).doc(id).delete();
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
  const prompt = `${env.PROMPT_TEMPLATE} ${text}`;

  console.log("propmt", prompt);
  const result = await genAIModel.generateContent(prompt);
  const responseText = result.response.text();
  console.log("result", responseText);
  const aiData = JSON.parse(responseText.replace(/\```(json)?/g, ""));
  console.log("aiData", aiData);

  return aiData;
}
