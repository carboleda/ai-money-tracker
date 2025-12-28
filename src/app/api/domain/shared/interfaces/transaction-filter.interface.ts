import { TransactionStatus } from "../transaction/model/transaction.model";

export interface FilterParams {
  status: TransactionStatus;
  account?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}
