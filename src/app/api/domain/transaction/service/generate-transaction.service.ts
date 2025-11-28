import { Injectable, Inject } from "@/app/api/decorators/tsyringe.decorator";
import type {
  GenAIService,
  GeneratedTransaction,
} from "@/app/api/domain/interfaces/generated-transaction.interface";
import { getMissingFieldsInPrompt } from "@/config/utils";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "../model/transaction.model";
import { DomainError } from "@/app/api/domain/errors/domain.error";
import { CreateTransactionService } from "./create-transaction.service";

type GenerateTransaction = {
  text?: string;
  picture?: string;
  createdAtManual?: Date | null;
  sourceAccount?: string;
};

@Injectable()
export class GenerateTransactionService {
  constructor(
    private readonly createTransactionService: CreateTransactionService,
    @Inject("GenAIService")
    private readonly genAIService: GenAIService
  ) {}

  async execute(input: GenerateTransaction): Promise<string> {
    const { text, picture, createdAtManual, sourceAccount } = input;
    if (!text && !picture) {
      throw new DomainError("Either text or picture must be provided", 400);
    }

    if (text) {
      const missingFields = getMissingFieldsInPrompt(text);

      if (missingFields.length > 0) {
        throw new DomainError(
          `Missing required fields in the prompt: ${missingFields.join(", ")}`,
          400
        );
      }
    }

    const generatedResponse = await this.genAIService.extractData(
      text,
      picture
    );

    if (!generatedResponse || generatedResponse?.error) {
      throw new DomainError(
        generatedResponse?.error ?? "Invalid transaction data received",
        400
      );
    }

    const generatedTransaction =
      generatedResponse as GeneratedTransaction.TransactionData;

    const transaction: Omit<TransactionModel, "id"> = {
      ...generatedTransaction,
      type: generatedTransaction.type as TransactionType,
      sourceAccount: sourceAccount
        ? sourceAccount
        : generatedTransaction.sourceAccount,
      createdAt: this.getProperCreatedAtDate(
        createdAtManual,
        generatedTransaction.createdAt
      ),
      status: TransactionStatus.COMPLETE,
    };

    return this.createTransactionService.execute(transaction);
  }

  private getProperCreatedAtDate(
    createdAtManual?: Date | null,
    createdAtGenerated?: string
  ): Date {
    if (createdAtManual) {
      return createdAtManual;
    }

    if (createdAtGenerated) {
      return new Date(createdAtGenerated);
    }

    return new Date();
  }
}
