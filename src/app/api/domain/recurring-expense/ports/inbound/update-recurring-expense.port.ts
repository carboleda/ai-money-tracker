import { CreateRecurringExpenseInput } from "./create-recurring-expense.port";

export interface UpdateRecurringExpenseInput
  extends CreateRecurringExpenseInput {
  id: string;
}
