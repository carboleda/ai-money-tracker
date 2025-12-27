import { TransactionDto } from "../transaction/model/transaction.dto";

export namespace GeneratedTransaction {
  export interface InvalidTransactionError {
    error: string;
  }

  export type TransactionData = Omit<TransactionDto, "createdAt"> & {
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
    text?: string,
    picture?: string
  ): Promise<GeneratedTransaction.GeneratedResponse>;
}
