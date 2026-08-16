import { CreateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/create-transaction.port";
import { CategoryModel } from "../../category/model/category.model";

export namespace GeneratedTransaction {
  export interface InvalidTransactionError {
    error: string;
  }

  export type TransactionData = Omit<CreateTransactionInput, "createdAt"> & {
    createdAt: string;
    error: never;
  };

  export type GeneratedResponse =
    | TransactionData
    | InvalidTransactionError
    | null;
}

export interface GenAIService {
  extractData(
    categories: CategoryModel[],
    text?: string,
    picture?: string
  ): Promise<GeneratedTransaction.GeneratedResponse>;
}
