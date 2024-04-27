import { db } from "@/config/firestore";
import { genAIModel } from "@/config/gen-ai";
import * as env from "@/config/env";

const COLLECTION_NAME = "transactions";

export async function GET() {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

  return Response.json({ data });
}

export async function POST(req: Request) {
  const trasactionText = await req.text();
  const trasactionJson = await generateTransactionJson(trasactionText);

  const transactionData = {
    ...trasactionJson,
    createAt: new Date().toISOString(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(transactionData);

  return Response.json({ id: docRef.id });
}

async function generateTransactionJson(text: string) {
  const prompt = `${env.PROMPT_TEMPLATE} ${text}`;

  console.log("propmt", prompt);
  const result = await genAIModel.generateContent(prompt);
  console.log("result", result);
  const aiData = JSON.parse(result.response.text().replace(/\```(json)?/g, ""));
  console.log("aiData", aiData);

  return aiData;
}
