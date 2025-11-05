import _ from "lodash";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { TypeSummaryDto } from "../model/type-summary.dto";

@Injectable()
export class CalculateTypeSummaryService {
  async execute(transactions: TransactionModel[]): Promise<TypeSummaryDto[]> {
    const transactionTypeGroups = _.groupBy(transactions, "type");
    return Object.entries(transactionTypeGroups).map(([type, transactions]) => {
      const total = transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );
      return { type, total };
    });
  }
}
