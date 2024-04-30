import { db } from "@/config/firestore";
import { genAIModel } from "@/config/genAI";
import { getMissingFieldsInPrompt } from "@/config/utils";
import * as env from "@/config/env";

const COLLECTION_NAME = "transactions";

export async function GET(req: Request) {
  const account = new URLSearchParams(req.url.split("?")[1]).get("acc");
  const collectionRef = db.collection(COLLECTION_NAME);

  let q = collectionRef.orderBy("createdAt", "desc");
  if (account) {
    q = q.where("sourceAccount", "==", account);
  }

  const snapshot = await q.get();
  const transactions = snapshot.docs.map((doc) => {
    const docData = doc.data();
    return {
      ...docData,
      id: doc.id,
      sourceAccount: env.VALID_ACCOUNTS[docData.sourceAccount],
      destinationAccount: env.VALID_ACCOUNTS[docData.destinationAccount],
    };
  });

  return new Response(
    JSON.stringify({ accounts: env.VALID_ACCOUNTS, transactions })
  );
}

export async function POST(req: Request) {
  const trasactionText = await req.text();
  const missingFields = getMissingFieldsInPrompt(trasactionText);

  if (missingFields.length > 0) {
    return new Response(null, { status: 400 });
  }

  const trasactionJson = await generateTransactionJson(trasactionText);

  const transactionData = {
    ...trasactionJson,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(transactionData);

  return new Response(JSON.stringify({ id: docRef.id }));
}

export async function DELETE(req: Request) {
  try {
    const id = await req.text();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return new Response(null, {
      status: 204,
      statusText: "Document successfully deleted!",
    });
  } catch (error) {
    console.error(error);
    return new Response(null, {
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
