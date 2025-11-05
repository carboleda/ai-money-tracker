import _ from "lodash";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { CategorySummaryDto } from "../model/category-summary.dto";

@Injectable()
export class CalculateCategorySummaryService {
  async execute(
    transactions: TransactionModel[]
  ): Promise<CategorySummaryDto[]> {
    const categoryGroups = _.groupBy(transactions, "category");
    return Object.entries(categoryGroups).map(([category, transactions]) => {
      const total =
        transactions?.reduce(
          (acc, transaction) =>
            acc +
            (transaction.type === TransactionType.INCOME
              ? transaction.amount
              : transaction.amount * -1),
          0
        ) ?? 0;

      return { category, total };
    });
  }
}
