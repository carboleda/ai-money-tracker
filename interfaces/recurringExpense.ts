import { Timestamp } from "firebase-admin/firestore";

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
  category: string;
  frequency: Frequency;
  dueDate: Timestamp;
  amount: number;
}

export interface RecurringExpense extends Omit<RecurringExpenseEntity, "dueDate"> {
  id: string;
  dueDate: string;
}

export interface GetRecurringExpensesConfigResponse {
  recurringExpensesConfig: RecurringExpense[];
}
