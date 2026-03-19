import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
  CategorySummary,
} from "@/app/api/domain/transaction/model/transaction.model";
import { RecurringVsVariableDto } from "../model/recurring-vs-variable.dto";

@Injectable()
export class CalculateRecurringVsVariableService {
  async execute(
    transactions: TransactionModel[]
  ): Promise<RecurringVsVariableDto> {
    const init = {
      recurringCount: 0,
      variableCount: 0,
      recurringTotal: 0,
      variableTotal: 0,
    };

    // TODO This is a naive implementation, we should ideally have a more robust way to determine if a transaction
    // is recurrent or variable, such as linking transactions to recurring expense templates.
    // For now, we'll use a simple heuristic based on transaction properties and categories.
    const recurringCategories = new Set(["GROCERIES"]);

    const isRecurring = (transaction: TransactionModel): boolean =>
      transaction.status === TransactionStatus.COMPLETE &&
      transaction.type === TransactionType.EXPENSE &&
      (transaction.isRecurrent ||
        recurringCategories.has((transaction.category as CategorySummary).ref));

    const summary = transactions.reduce((acc, transaction) => {
      if (
        transaction.status === TransactionStatus.PENDING ||
        transaction.type !== TransactionType.EXPENSE
      ) {
        return acc;
      }

      if (isRecurring(transaction)) {
        acc.recurringCount++;
        acc.recurringTotal += transaction.amount;
      } else {
        acc.variableCount++;
        acc.variableTotal += transaction.amount;
      }

      return acc;
    }, init);

    return {
      count: [
        { value: summary.recurringCount, type: "recurrent" },
        { value: summary.variableCount, type: "variable" },
      ],
      total: [
        { value: summary.recurringTotal, type: "recurrent" },
        { value: summary.variableTotal, type: "variable" },
      ],
    };
  }
}
