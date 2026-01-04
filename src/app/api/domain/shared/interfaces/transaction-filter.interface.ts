import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";

export interface FilterParams {
  status: TransactionStatus;
  account?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}
