import {
  RecurringExpenseModel,
  Frequency,
} from "@/app/api/domain/recurring-expense/model/recurring-expense.model";

export const recurringExpenseModelFixture = new RecurringExpenseModel({
  id: "test-id-1",
  description: "Monthly Rent",
  category: "Housing",
  frequency: Frequency.MONTHLY,
  dueDate: new Date("2024-01-01"),
  amount: 1000,
  disabled: false,
  paymentLink: "https://example.com/pay",
  notes: "Test recurring expense",
});
