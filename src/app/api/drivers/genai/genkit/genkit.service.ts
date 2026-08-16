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
import { CategoryModel } from "@/app/api/domain/category/model/category.model";

@Injectable()
export class GenkitService implements GenAIService {
  private readonly ai: Genkit;
  private readonly extractDataPrompt: ExecutablePrompt<
    CreateTransactionInputType,
    typeof CreateTransactionOutputSchema,
    z.ZodTypeAny
  >;

  constructor() {
    const promptDir = path.join(process.cwd(), "prompts");
    console.log("Initializing GenkitService...", promptDir);

    this.ai = genkit({
      promptDir,
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
    categories: CategoryModel[],
    text?: string,
    picture?: string
  ): Promise<GeneratedTransaction.GeneratedResponse> {
    const input = {
      categories: categories.map((c) => ({
        ref: c.ref,
        description: c.description || c.name,
      })),
      text: text,
      picture: picture,
    } as CreateTransactionInputType;

    const { output } = await this.extractDataPrompt(input);

    return (
      output?.type === "error" ? output.error : output?.data
    ) as GeneratedTransaction.GeneratedResponse;
  }
}
