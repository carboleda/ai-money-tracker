import { Frequency } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";

export interface CreateRecurrentExpenseInput {
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: Date;
  disabled?: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;
}
