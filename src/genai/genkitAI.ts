import { ExecutablePrompt, Genkit, genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import {
  CreateTransactionInputType,
  CreateTransactionInputSchema,
  CreateTransactionOutputSchema,
} from "@/genai/schemas/createTransaction";
import { GeneratedTransaction } from "@/interfaces/transaction";
import path from "node:path";

export class GenkitAI {
  private static instance: GenkitAI;
  private readonly ai: Genkit;
  private readonly extractDataPrompt: ExecutablePrompt<
    CreateTransactionInputType,
    typeof CreateTransactionOutputSchema,
    z.ZodTypeAny
  >;

  private constructor() {
    console.log(
      "Initializing GenkitAI...",
      path.join(process.cwd(), "prompts")
    );
    this.ai = genkit({
      promptDir: path.join(process.cwd(), "prompts"),
      plugins: [googleAI()],
      model: gemini20Flash,
    });
    this.ai.defineSchema(
      "CreateTransactionInputSchema",
      CreateTransactionInputSchema
    );
    this.ai.defineSchema(
      "CreateTransactionOutputSchema",
      CreateTransactionOutputSchema
    );
    this.extractDataPrompt = this.ai.prompt("extractTransactionData");
  }

  public static getInstance(): GenkitAI {
    if (!GenkitAI.instance) {
      GenkitAI.instance = new GenkitAI();
    }
    return GenkitAI.instance;
  }

  async extractData(
    text?: string,
    picture?: string
  ): Promise<GeneratedTransaction.GeneratedResponse> {
    const input = {
      text: text,
      picture: picture,
    } as CreateTransactionInputType;

    const { output } = await this.extractDataPrompt(input);

    return (
      output?.type === "error" ? output.error : output?.data
    ) as GeneratedTransaction.GeneratedResponse;
  }
}
