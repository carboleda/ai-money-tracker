import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { ExecutablePrompt, Genkit, genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import {
  CreateTransactionInputType,
  CreateTransactionInputSchema,
  CreateTransactionOutputSchema,
} from "./schemas/create.transaction.schema";
import {
  GenAIService,
  GeneratedTransaction,
} from "@/app/api/domain/shared/interfaces/generated-transaction.interface";
import path from "node:path";

@Injectable()
export class GenkitService implements GenAIService {
  private readonly ai: Genkit;
  private readonly extractDataPrompt: ExecutablePrompt<
    CreateTransactionInputType,
    typeof CreateTransactionOutputSchema,
    z.ZodTypeAny
  >;

  constructor() {
    console.log(
      "Initializing GenkitService...",
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
