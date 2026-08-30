import { groupBy } from "lodash";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import {
  TransactionModel,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { CategorySummaryDto } from "../model/category-summary.dto";

@Injectable()
export class CalculateCategorySummaryService {
  async execute(
    transactions: TransactionModel[],
  ): Promise<CategorySummaryDto[]> {
    const filteredTransactions = transactions.filter(
      (t) => t.type !== TransactionType.TRANSFER,
    );
    const categoryGroups = groupBy(filteredTransactions, (t) =>
      typeof t.category === "string" ? t.category : t.category?.name,
    );
    return Object.entries(categoryGroups).map(([category, transactions]) => {
      const total =
        transactions?.reduce(
          (acc, transaction) =>
            acc +
            (transaction.type === TransactionType.INCOME
              ? transaction.amount
              : transaction.amount * -1),
          0,
        ) ?? 0;

      return { category, total };
    });
  }
}
