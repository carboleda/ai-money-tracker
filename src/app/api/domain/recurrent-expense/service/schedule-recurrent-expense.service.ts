import { GetAllRecurrentExpensesService } from "./get-all-recurrent-expenses.service";
import {
  Frequency,
  RecurrentExpenseModel,
} from "../model/recurrent-expense.model";
import { CreateTransactionService } from "@/app/api/domain/transaction/service/create-transaction.service";
import {
  TransactionType,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";
import { computeBiannualDates } from "@/config/utils";
import { Injectable } from "@/app/api/decorators/tsyringe.decorator";

type ScheduleResult = {
  created: number;
  skipped: number;
};

@Injectable()
export class ScheduleRecurrentExpenseService {
  constructor(
    private readonly getAllRecurrentExpensesService: GetAllRecurrentExpensesService,
    private readonly createTransactionService: CreateTransactionService
  ) {}

  async execute(): Promise<ScheduleResult> {
    let created = 0;
    let skipped = 0;

    const { recurringExpenses } =
      await this.getAllRecurrentExpensesService.execute();

    for await (const recurringExpense of recurringExpenses) {
      if (recurringExpense.disabled) {
        skipped++;
        continue;
      }
      const createdAt = this.getTransactionDate(recurringExpense);
      if (!createdAt) {
        skipped++;
        continue;
      }

      await this.createTransactionService.execute({
        type: TransactionType.EXPENSE,
        status: TransactionStatus.PENDING,
        isRecurrent: true,
        description: recurringExpense.description,
        category: recurringExpense.category,
        amount: recurringExpense.amount,
        createdAt,
        paymentLink: recurringExpense.paymentLink,
        notes: recurringExpense.notes,
        sourceAccount: "",
      });

      created++;
    }

    return { created, skipped };
  }

  /**
   * Determines the transaction date for a given recurring expense based on its frequency and due date.
   * - First it chackes if it's monthly frequency or yearly frequency.
   *   For yearly it checks if the current month matches the due date's month and for any of the cases
   *   it returns the due date with the current year and moth.
   * - For biannual frequency, it computes potential biannual dates and checks if any of them
   *   match the current month, returning the matching date with the current year.
   * - If no conditions are met, it returns null.
   * @param recurringExpense The recurring expense to check.
   * @returns null if the transaction should not be created for the current period.
   */
  private getTransactionDate(
    recurringExpense: RecurrentExpenseModel
  ): Date | null {
    const now = new Date();
    const dueDate = new Date(recurringExpense.dueDate);
    let createdAt = new Date(recurringExpense.dueDate);

    if (
      recurringExpense.frequency === Frequency.MONTHLY ||
      (recurringExpense.frequency === Frequency.YEARLY &&
        now.getMonth() === dueDate.getMonth())
    ) {
      createdAt.setFullYear(now.getFullYear());
      createdAt.setMonth(now.getMonth());
      return createdAt;
    }

    if (recurringExpense.frequency === Frequency.BIANNUAL) {
      const dates = computeBiannualDates(dueDate);
      const dateIndex = dates.findIndex(
        (date) => date.getMonth() === now.getMonth()
      );
      if (dateIndex !== -1) {
        createdAt = dates[dateIndex];
        createdAt.setFullYear(now.getFullYear());
        return createdAt;
      }
    }

    return null;
  }
}
