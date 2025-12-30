import { CreateTransactionInput } from "../../transaction/ports/inbound/create-transaction.port";

export namespace GeneratedTransaction {
  export interface InvalidTransactionError {
    error: string;
  }

  export type TransactionData = CreateTransactionInput & {
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
