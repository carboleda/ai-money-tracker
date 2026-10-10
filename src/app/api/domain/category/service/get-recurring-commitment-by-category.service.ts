import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { RecurringExpenseModel } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseRepository } from "@/app/api/domain/recurring-expense/repository/recurring-expense.repository";
import { getMonthlyEquivalentAmount } from "@/config/utils";

@Injectable()
export class GetRecurringCommitmentByCategoryService
  implements Service<void, Map<string, number>>
{
  constructor(
    @InjectRepository(RecurringExpenseModel)
    private readonly recurringExpenseRepository: RecurringExpenseRepository,
  ) {}

  async execute(): Promise<Map<string, number>> {
    const recurringExpenses = await this.recurringExpenseRepository.getAll();

    const commitmentByRef = new Map<string, number>();

    recurringExpenses
      .filter((recurringExpense) => !recurringExpense.disabled)
      .forEach((recurringExpense) => {
        const categoryRef =
          typeof recurringExpense.category === "string"
            ? recurringExpense.category
            : recurringExpense.category.ref;

        const monthlyEquivalent = getMonthlyEquivalentAmount(
          recurringExpense.amount,
          recurringExpense.frequency,
        );

        commitmentByRef.set(
          categoryRef,
          (commitmentByRef.get(categoryRef) || 0) + monthlyEquivalent,
        );
      });

    return commitmentByRef;
  }
}
