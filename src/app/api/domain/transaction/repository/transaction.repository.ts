import { FilterParams } from "@/app/api/domain/interfaces/transaction-filter.interface";
import { TransactionModel } from "../model/transaction.model";

export interface TransactionRepository {
  getById(id: string): Promise<TransactionModel | null>;
  create(transaction: Omit<TransactionModel, "id">): Promise<string>;
  update(transaction: TransactionModel): Promise<void>;
  delete(id: string): Promise<void>;
  searchTransactions(params: FilterParams): Promise<TransactionModel[]>;
}
