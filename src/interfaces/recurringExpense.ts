import { Frequency } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";

export const frequencyOptions = Object.entries(Frequency).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<Frequency, string>
);

export { Frequency } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
