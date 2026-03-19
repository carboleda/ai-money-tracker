import { RecurringExpenseModel } from "../model/recurring-expense.model";

export interface RecurringExpenseRepository {
  getAll(): Promise<RecurringExpenseModel[]>;
  getById(id: string): Promise<RecurringExpenseModel | null>;
  create(recurringExpense: Omit<RecurringExpenseModel, "id">): Promise<string>;
  update(recurringExpense: RecurringExpenseModel): Promise<void>;
  delete(id: string): Promise<void>;
}
