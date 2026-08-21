import { Injectable, Inject } from "@/app/api/decorators/tsyringe.decorator";
import type { GenAIService } from "@/app/api/domain/shared/interfaces/parsed-transaction.interface";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { GetAllCategoriesService } from "@/app/api/domain/category/service/get-all-categories.service";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import {
  ParseTransactionInputDTO,
  ParseTransactionDraftResponse,
} from "../ports/inbound/parse-transaction.port";

interface ParseTransactionErrorDetails {
  code: string;
  missingFields?: string[];
}

@Injectable()
export class ParseTransactionDraftService
  implements Service<ParseTransactionInputDTO, ParseTransactionDraftResponse>
{
  constructor(
    private readonly getAllCategoriesService: GetAllCategoriesService,
    private readonly getAllAccountsService: GetAllAccountsService,
    @Inject("GenAIService")
    private readonly genAIService: GenAIService
  ) {}

  async execute(
    input: ParseTransactionInputDTO
  ): Promise<ParseTransactionDraftResponse> {
    const { text, picture } = input;

    if (!text?.trim() && !picture) {
      throw new DomainError<ParseTransactionErrorDetails>(
        "Missing required transaction information. Please provide an amount or description.",
        400,
        { code: "MISSING_INPUT_FIELDS", missingFields: ["amount", "description"] }
      );
    }

    const [categories, accounts] = await Promise.all([
      this.getAllCategoriesService.execute(),
      this.getAllAccountsService.execute(),
    ]);

    const result = await this.genAIService.extractData(
      categories,
      accounts,
      text,
      picture
    );

    if (!result || "error" in result) {
      throw new DomainError<ParseTransactionErrorDetails>(
        result?.error ??
          "AI could not recognize transaction details from the provided input. Please enter values manually.",
        422,
        { code: "UNPARSEABLE_DRAFT" }
      );
    }

    return {
      amount: result.amount,
      type: result.type,
      categoryRef: result.category,
      sourceAccountRef: result.sourceAccount,
      destinationAccountRef: result.destinationAccount,
      description: result.description,
      createdAt: result.createdAt ?? new Date().toISOString(),
      confidence: result.confidence,
    };
  }
}
