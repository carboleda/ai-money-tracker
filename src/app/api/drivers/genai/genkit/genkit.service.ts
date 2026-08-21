import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { ExecutablePrompt, Genkit, genkit, z } from "genkit";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import {
  ParseTransactionInputType,
  ParseTransactionInputSchema,
  ParseTransactionOutputSchema,
} from "./schemas/parse.transaction.schema";
import {
  GenAIService,
  ParsedTransactionResult,
} from "@/app/api/domain/shared/interfaces/parsed-transaction.interface";
import path from "node:path";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { AccountModel } from "@/app/api/domain/account/model/account.model";

@Injectable()
export class GenkitService implements GenAIService {
  private readonly ai: Genkit;
  private readonly extractDataPrompt: ExecutablePrompt<
    ParseTransactionInputType,
    typeof ParseTransactionOutputSchema,
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
      "ParseTransactionInputSchema",
      ParseTransactionInputSchema
    );
    this.ai.defineSchema(
      "ParseTransactionOutputSchema",
      ParseTransactionOutputSchema
    );
    this.extractDataPrompt = this.ai.prompt("extractTransactionData");
  }

  async extractData(
    categories: CategoryModel[],
    accounts: AccountModel[],
    text?: string,
    picture?: string
  ): Promise<ParsedTransactionResult> {
    const input = {
      categories: categories.map((c) => ({
        ref: c.ref,
        name: c.name,
        description: c.description || c.name,
      })),
      accounts: accounts.map((a) => ({
        ref: a.ref,
        name: a.name,
        type: a.type,
        description: a.description || a.name,
      })),
      text: text,
      picture: picture,
    } as ParseTransactionInputType;

    const { output } = await this.extractDataPrompt(input);

    return (
      output?.type === "error" ? output.error : output?.data
    ) as ParsedTransactionResult;
  }
}
