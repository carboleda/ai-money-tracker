import { TransactionCategory } from "@/app/api/domain/transaction/model/transaction.model";
import { Timestamp } from "firebase-admin/firestore";

export enum Frequency {
  Monthly = "monthly",
  Biannual = "biannual",
  Yearly = "yearly",
}

export enum FrequencyGroup {
  Monthly = "monthly",
  Others = "others",
}

export const frequencyOptions = Object.entries(Frequency).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<Frequency, string>
);

export interface RecurringExpenseEntity {
  id: string;
  description: string;
  category: TransactionCategory;
  frequency: Frequency;
  dueDate: Timestamp;
  disabled: boolean;
  amount: number;
  paymentLink?: string;
  notes?: string;
}

export interface RecurringExpense
  extends Omit<RecurringExpenseEntity, "dueDate"> {
  id: string;
  dueDate: string;
}

export interface GetRecurringExpensesResponse {
  recurringExpensesConfig: RecurringExpense[];
  groupTotal: Record<FrequencyGroup, number>;
}
