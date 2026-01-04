import { CreateTransactionInput } from "./create-transaction.port";

export interface UpdateTransactionInput
  extends Omit<CreateTransactionInput, "createdAt"> {
  id: string;
  createdAt: string;
}
