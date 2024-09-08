export enum Frequency {
  Monthly = "monthly",
  Biannual = "biannual",
  Yearly = "yearly",
}

export const frequencyLabels = Object.keys(Frequency);
export const frequencyKeys = Object.values(Frequency);

export interface RecurringExpenseConfig {
  id: string;
  description: string;
  category: string;
  frequency: Frequency;
  dueDate: Date;
  amount: number;
}

export interface RecurringExpense
  extends Omit<RecurringExpenseConfig, "date" | "frequency"> {
  paid: boolean;
  account: string;
}
