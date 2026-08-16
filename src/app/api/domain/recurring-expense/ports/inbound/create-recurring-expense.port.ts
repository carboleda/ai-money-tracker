import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";

export interface CreateRecurringExpenseInput {
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: Date;
  disabled?: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;
}
