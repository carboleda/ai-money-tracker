export namespace GeneratedTransaction {
  export interface InvalidTransactionError {
    error: string;
  }

  export interface TransactionData {
    description: string;
    amount: number;
    type: string;
    sourceAccount: string;
    category?: string;
    createdAt?: string;
    destinationAccount?: string;
    error: never;
  }

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
