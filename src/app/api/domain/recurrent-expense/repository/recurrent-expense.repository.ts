import { RecurrentExpenseModel } from "../model/recurrent-expense.model";

export interface RecurrentExpenseRepository {
  getAll(): Promise<RecurrentExpenseModel[]>;
  getById(id: string): Promise<RecurrentExpenseModel | null>;
  create(recurrentExpense: Omit<RecurrentExpenseModel, "id">): Promise<string>;
  update(recurrentExpense: RecurrentExpenseModel): Promise<void>;
  delete(id: string): Promise<void>;
}
