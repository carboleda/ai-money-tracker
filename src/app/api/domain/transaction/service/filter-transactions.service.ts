import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel } from "../model/transaction.model";
import { FilterParams } from "@/app/api/domain/shared/interfaces/transaction-filter.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

@Injectable()
export class FilterTransactionsService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly repository: TransactionRepository
  ) { }

  async execute(params: FilterParams): Promise<TransactionModel[]> {
    const transactions = await this.repository.searchTransactions(params);
    return transactions.filter(
      (transaction) => transaction.status === params.status
    );
  }
}
