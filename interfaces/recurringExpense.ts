import { Timestamp } from "firebase-admin/firestore";
import { TransactionCategory } from "./transaction";

export enum Frequency {
  Monthly = "monthly",
  Biannual = "biannual",
  Yearly = "yearly",
}

export const frequencyOptions = Object.entries(Frequency).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<Frequency, string>
);

export interface RecurringExpenseEntity {
  description: string;
  paymentLink?: string;
  category: TransactionCategory;
  frequency: Frequency;
  dueDate: Timestamp;
  amount: number;
}

export interface RecurringExpense extends Omit<RecurringExpenseEntity, "dueDate"> {
  id: string;
  dueDate: string;
}

export interface GetRecurringExpensesResponse {
  recurringExpensesConfig: RecurringExpense[];
}
