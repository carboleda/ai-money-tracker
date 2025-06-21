import { GenerateResponse, genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import {
  CreateTransactionInputType,
  CreateTransactionOutputType,
  InputSchema,
  OutputSchema,
} from "@/genai/schemas/createTransaction";
import { GeneratedTransaction } from "@/interfaces/transaction";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

ai.defineSchema("CreateTransactionInputSchema", InputSchema);

ai.defineSchema("CreateTransactionOutputSchema", OutputSchema);

const extractDataPrompt = ai.prompt<
  typeof InputSchema,
  typeof OutputSchema,
  z.ZodTypeAny
>("extractTransactionData");

export async function extractData(
  text?: string,
  picture?: string
): Promise<GeneratedTransaction.GeneratedResponse> {
  const input = { text: text, picture: picture } as CreateTransactionInputType;

  return extractDataPrompt(input).then(
    (
      response: GenerateResponse<CreateTransactionOutputType>
    ): GeneratedTransaction.GeneratedResponse => {
      if (response.output?.type === "error") {
        return response.output.error as GeneratedTransaction.GeneratedResponse;
      }

      return response.output?.data as GeneratedTransaction.GeneratedResponse;
    }
  );
}
