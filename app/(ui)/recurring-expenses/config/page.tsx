import { ConfigRecurringExpensesTable } from "@/components/RecurringExpenses/ConfigTable/ConfigTable";
import {
  Frequency,
  RecurringExpenseConfig,
} from "@/interfaces/recurringExpense";

const recurringExpenses: RecurringExpenseConfig[] = [
  {
    id: "1",
    description: "Rent",
    category: "Housing",
    frequency: Frequency.Monthly,
    dueDate: new Date("2022-01-01"),
    amount: 1000,
  },
  {
    id: "2",
    description: "Car Insurance",
    category: "Auto",
    frequency: Frequency.Biannual,
    dueDate: new Date("2022-01-01"),
    amount: 500,
  },
  {
    id: "3",
    description: "Gym Membership",
    category: "Health",
    frequency: Frequency.Yearly,
    dueDate: new Date("2022-01-01"),
    amount: 50,
  },
];

export default function ConfigRecurringExpenses() {
  const isLoading = false;
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <ConfigRecurringExpensesTable
        recurringExpenses={recurringExpenses}
        isLoading={isLoading}
      />
    </section>
  );
}
