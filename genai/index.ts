import {
  FunctionCallingMode,
  GoogleGenerativeAI,
  Part,
} from "@google/generative-ai";
import { Env } from "@/config/env";
import { tools } from "./tools";
import { GeneratedTransaction } from "@/interfaces/transaction";

const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);
const generationConfig = {
  temperature: 0,
};
const systemInstruction = `Act as an accountant assistant, you will help me to record my money transactions.
  I share the transactions with you either as a text description or an invoice picture.

  ### INSTRUCTIONS ###
  - If I provide a text describing the transaction, it will follow the following pattern: 'DESCRIPTION by AMOUNT, ACCOUNT'.
  - Transfer transactions will have the following pattern: 'TRANSFER DESCRIPTION from ACCOUNT to ACCOUNT by AMOUNT'.
  - If the provided a text and it is not clear or is not a valid transaction, you must report the error.
  - If the provided an image, but it is not clear or is not a valid invoice, you must report the error.
  - In any case, you must use the available tools to record the transactions.
  ### INSTRUCTIONS ###`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  // https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/function-calling#functioncallingconfig
  toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.ANY } },
  tools,
  systemInstruction,
  generationConfig,
});

/**
 * Extract the request part from the content
 * @param content { description, picture } An object with the description and picture. Only one is required.
 * @returns A part object to be used in the model.generateContent method
 */
function getRequestPart(text?: string, picture?: string): Part[] {
  if (text) {
    return [
      {
        text,
      },
    ];
  }

  // Separate header from the base64 data: data:image/jpeg;base64...
  const [header, data] = picture!.split(",");
  // Extract the mime type from the header: image/jpeg
  const [mimeType] = /[a-z]+\/[a-z]+/.exec(header) ?? [];

  return [
    {
      text: "Extract the data from the provided picture.",
    },
    {
      inlineData: {
        data,
        mimeType: mimeType!,
      },
    },
  ];
}

export async function extractData(
  text?: string,
  picture?: string
): Promise<GeneratedTransaction.GeneratedResponse> {
  const result = await model.generateContent(getRequestPart(text, picture));

  console.log(result, { depth: null });

  if (!result?.response?.candidates) {
    return null;
  }

  for (const candidate of result.response.candidates) {
    for (const part of candidate.content.parts) {
      if (part.functionCall) {
        return part.functionCall.args as GeneratedTransaction.GeneratedResponse;
      }
    }
  }

  return null;
}
