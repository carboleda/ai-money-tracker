import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import {
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";

export interface RecurrentExpenseOutput {
  id: string;
  description: string;
  category: CategorySummary;
  frequency: Frequency;
  dueDate: string;
  disabled: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;
}

export interface GetRecurrentExpensesOutput {
  recurringExpensesConfig: RecurrentExpenseOutput[];
  groupTotal: Record<FrequencyGroup, number>;
}
