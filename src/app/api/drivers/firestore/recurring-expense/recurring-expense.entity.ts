import { Timestamp } from "firebase-admin/firestore";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";

export interface RecurringExpenseEntity {
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: Timestamp;
  disabled: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;
}
