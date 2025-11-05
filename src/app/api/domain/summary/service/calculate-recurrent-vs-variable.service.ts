import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
  TransactionCategory,
} from "@/app/api/domain/transaction/model/transaction.model";
import { RecurrentVsVariableDto } from "../model/recurrent-vs-variable.dto";

@Injectable()
export class CalculateRecurrentVsVariableService {
  async execute(
    transactions: TransactionModel[]
  ): Promise<RecurrentVsVariableDto> {
    const init = {
      recurrentCount: 0,
      variableCount: 0,
      recurrentTotal: 0,
      variableTotal: 0,
    };

    const recurrentCategories = [TransactionCategory.Mercado];

    const isRecurrent = (transaction: TransactionModel): boolean =>
      transaction.status === TransactionStatus.COMPLETE &&
      transaction.type === TransactionType.EXPENSE &&
      (transaction.isRecurrent ||
        recurrentCategories.includes(
          transaction.category as TransactionCategory
        ));

    const summary = transactions.reduce((acc, transaction) => {
      if (
        transaction.status === TransactionStatus.PENDING ||
        transaction.type !== TransactionType.EXPENSE
      ) {
        return acc;
      }

      if (isRecurrent(transaction)) {
        acc.recurrentCount++;
        acc.recurrentTotal += transaction.amount;
      } else {
        acc.variableCount++;
        acc.variableTotal += transaction.amount;
      }

      return acc;
    }, init);

    return {
      count: [
        { value: summary.recurrentCount, type: "recurrent" },
        { value: summary.variableCount, type: "variable" },
      ],
      total: [
        { value: summary.recurrentTotal, type: "recurrent" },
        { value: summary.variableTotal, type: "variable" },
      ],
    };
  }
}
