import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { SummaryHistoryModel } from "../model/summary-history.model";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

@Injectable()
export class CalculateCurrentMonthSummaryService
  implements Service<TransactionModel[], SummaryHistoryModel> {
  private static readonly CURRENT_MONTH_ID = "current";

  async execute(
    transactions: TransactionModel[]
  ): Promise<SummaryHistoryModel> {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalTransfers = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING) {
        return;
      }

      if (transaction.type === TransactionType.INCOME) {
        totalIncomes += transaction.amount;
      } else if (transaction.type === TransactionType.TRANSFER) {
        totalTransfers += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    return new SummaryHistoryModel({
      id: CalculateCurrentMonthSummaryService.CURRENT_MONTH_ID,
      incomes: totalIncomes,
      expenses: totalExpenses,
      transfers: totalTransfers,
      createdAt: new Date(),
    });
  }
}
