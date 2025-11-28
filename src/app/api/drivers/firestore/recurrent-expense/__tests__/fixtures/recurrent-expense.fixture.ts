import { RecurrentExpenseModel, Frequency } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";

export const recurrentExpenseModelFixture = new RecurrentExpenseModel({
  id: "test-id-1",
  description: "Monthly Rent",
  category: "Housing",
  frequency: Frequency.MONTHLY,
  dueDate: new Date("2024-01-01"),
  amount: 1000,
  disabled: false,
  paymentLink: "https://example.com/pay",
  notes: "Test recurring expense"
}); 