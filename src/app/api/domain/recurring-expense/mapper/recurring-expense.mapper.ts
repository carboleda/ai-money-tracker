import type { CategorySummary } from "@/app/api/domain/transaction/model/transaction.model";
import { RecurringExpenseModel } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { CreateRecurringExpenseInput } from "../ports/inbound/create-recurring-expense.port";
import type { UpdateRecurringExpenseInput } from "../ports/inbound/update-recurring-expense.port";
import type { RecurringExpenseOutput } from "../ports/outbound/get-recurring-expenses.port";

export class RecurringExpenseMapper {
  static fromCreateToModel(
    input: CreateRecurringExpenseInput,
  ): RecurringExpenseModel {
    return new RecurringExpenseModel({
      ...input,
      id: "",
      disabled: input.disabled ?? false,
    });
  }

  static fromUpdateToModel(
    input: UpdateRecurringExpenseInput,
  ): RecurringExpenseModel {
    return new RecurringExpenseModel({
      ...input,
      dueDate: new Date(input.dueDate),
    });
  }

  static toOutputPort(model: RecurringExpenseModel): RecurringExpenseOutput {
    const category = RecurringExpenseMapper.resolveCategorySummary(
      model.category,
    );

    return {
      id: model.id,
      description: model.description,
      category,
      frequency: model.frequency,
      dueDate: model.dueDate.toISOString(),
      disabled: model.disabled,
      amount: model.amount,
      paymentLink: model.paymentLink,
      notes: model.notes,
    };
  }

  private static resolveCategorySummary(
    category: CategorySummary | string,
  ): CategorySummary {
    if (typeof category !== "string") {
      return category;
    }

    return {
      ref: category,
      name: category,
      icon: null,
      color: null,
    };
  }
}
