import { Timestamp } from "firebase-admin/firestore";
import { Frequency } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";

export interface RecurrentExpenseEntity {
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: Timestamp;
  disabled: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;
} 