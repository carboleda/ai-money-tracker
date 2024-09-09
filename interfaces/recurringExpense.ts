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

export interface RecurringExpenseConfig {
  id: string;
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: string;
  amount: number;
}

export interface RecurringExpenseConfigCreateRequest
  extends Omit<RecurringExpenseConfig, "id"> {}

export interface RecurringExpense
  extends Omit<RecurringExpenseConfig, "date" | "frequency"> {
  paid: boolean;
  account: string;
}

export interface GetRecurringExpensesConfigResponse {
  recurringExpensesConfig: RecurringExpenseConfig[];
}