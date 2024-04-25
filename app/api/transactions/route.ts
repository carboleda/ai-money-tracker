import { db } from "@/config/firestore";
import { genAIModel } from "@/config/gen-ai";

const COLLECTION_NAME = "transactions";
const prompTemplate = `You are my assistant and you will help me to register my money transactions.
You will take a text input describing a transaction and converts it into a JSON object with the following fields: description, type (income, expense, or transfer), category (if applicable), sourceAccount, destinationAccount (if it's a transfer), and amount. Assume that the input format is consistent and follows one of the following patterns:

1. 'DESCRIPTION by AMOUNT, ACCOUNT' (for regular transactions)
2. 'Transference DESCRIPTION from SOURCE_ACCOUNT to DESTINATION_ACCOUNT by AMOUNT'. (for transfers between accounts)

You need to determine the type and category of the transaction based on the description. For regular transactions, the category could be inferred from keywords like 'buy', 'purchase', etc. For transfers, set the type as 'transfer' and include both the source and destination accounts.

The following are examples of inputs and outputs:
- Input: Ingresos por intereses 1200, AFC
  Output: {
    "description": "Ingresos por intereses",
    "amount": 1200,
    "type": "income",
    "category": "Intereses",
    "sourceAccount": "AFC"
  }
- Input: Pago recibo de gas por 31954, C1408
  Output: {
    "description": "Pago recibo de gas",
    "amount": 31954,
    "type": "expense",
    "category": "Servicios",
    "sourceAccount": "C1408"
  }
- Input: Pago de administración Masari por 301000, C1408
  Output: {
    "description": "Pago de administración Masari",
    "amount": 301000,
    "type": "expense",
    "category": "Vivienda",
    "sourceAccount": "C1408"
  }
- Input: Pago de cuota Masari por 1600000, AFC
  Output: {
    "description": "Pago de cuota Masari",
    "amount": 1600000,
    "type": "expense",
    "category": "Vivienda",
    "sourceAccount": "AFC"
  }
- Input: Compra SOAT del carro por 400000, C2163
  Output: {
    "description": "Compra SOAT del carro",
    "amount": 400000,
    "type": "expense",
    "category": "Transporte",
    "sourceAccount": "C1408"
  }
- Input: C2163: Compra de mercado por 700000
  Output: {
    "description": "Compra de mercado",
    "amount": 700000,
    "type": "expense",
    "category": "Mercado",
    "sourceAccount": "C2163"
  }
- Input: Retiro en cajero por 200000, C1408
  Output: {
    "description": "Retiro en cajero",
    "amount": 200000,
    "type": "expense",
    "category": "Retiros",
    "sourceAccount": "C1408"
  }
- Input: Intereses cuenta de ahorro por 3000, C1408
  Output: {
    "description": "Intereses cuenta de ahorro",
    "amount": 3000,
    "type": "income",
    "category": "Intereses",
    "sourceAccount": "C1408"
  }
- Input: Devolución de prestamo por 1000000, C1408
  Output: {
    "description": "Devolución de prestamo",
    "amount": 1000000,
    "type": "income",
    "category": "Prestamos",
    "sourceAccount": "C1408"
  }
- Input: C2163: Costos TC 2900
  Output: {
    "description": "Costos TC",
    "amount": 2900,
    "type": "expense",
    "category": "Costos Scotiabank",
    "sourceAccount": "C2163"
  }
- Input: Compra de gotas oftálmicas por 50000, C2163
  Output: {
    "description": "Compra de gotas oftálmicas",
    "amount": 50000,
    "type": "expense",
    "category": "Medicamentos",
    "sourceAccount": "C2163"
  }
- Input: Intereses cuenta de ahorros por 3000, C1408
  Output: {
    "description": "Intereses cuenta de ahorros",
    "amount": 3000,
    "type": "income",
    "category": "Intereses",
    "sourceAccount": "C1408"
  }

Constrains:
1. Only respond to the last question asked
2. Respond only with the plain text in JSON
3. Do not include the accounts in the description

Valid source and destination accounts are: C2163, C1408, AFC. Do not encode the accounts.

`;

export async function GET() {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

  return Response.json({ data });
}

export async function POST(req: Request) {
  const reqText = await req.text();
  const prompt = `${prompTemplate} ${reqText}`;

  console.log("propmt", prompt);
  const result = await genAIModel.generateContent(prompt);
  console.log("result", result);
  const aiData = JSON.parse(result.response.text().replace(/\```(json)?/g, ""));
  console.log("aiData", aiData);

  const data = {
    ...aiData,
    date: new Date().toISOString(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(data);
  console.log("docRef", docRef.id);

  return Response.json({ id: docRef.id });
}
