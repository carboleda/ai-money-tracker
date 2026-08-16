import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import {
  Frequency,
  FrequencyGroup,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";

export interface RecurringExpenseOutput {
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

export interface GetRecurringExpensesOutput {
  recurringExpensesConfig: RecurringExpenseOutput[];
  groupTotal: Record<FrequencyGroup, number>;
}
