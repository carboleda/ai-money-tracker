import { CreateRecurrentExpenseInput } from "./create-recurrent-expense.port";

export interface UpdateRecurrentExpenseInput
  extends CreateRecurrentExpenseInput {
  id: string;
}
