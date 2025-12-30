import { CreateTransactionInput } from "./create-transaction.port";

export interface UpdateTransactionInput extends CreateTransactionInput {
  id: string;
}
