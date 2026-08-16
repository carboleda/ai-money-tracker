import type { RecurringExpenseRepository } from "../repository/recurring-expense.repository";
import {
  RecurringExpenseModel,
  Frequency,
  FrequencyGroup,
} from "../model/recurring-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import type { GetRecurringExpensesOutput } from "../ports/outbound/get-recurring-expenses.port";
import { RecurringExpenseMapper } from "../mapper/recurring-expense.mapper";
import { Service } from "@/app/api/domain/shared/ports/service.interface";

@Injectable()
export class GetAllRecurringExpensesService
  implements Service<void, GetRecurringExpensesOutput>
{
  constructor(
    @InjectRepository(RecurringExpenseModel)
    private readonly recurringExpenseRepository: RecurringExpenseRepository
  ) {}

  async execute(): Promise<GetRecurringExpensesOutput> {
    const recurringExpenses = await this.recurringExpenseRepository.getAll();
    const groupTotal = this.getGroupedTotal(recurringExpenses);
    const recurringExpensesConfig = recurringExpenses.map(
      RecurringExpenseMapper.toOutputPort
    );

    return { recurringExpensesConfig, groupTotal };
  }

  private getGroupedTotal(
    recurringExpenses: RecurringExpenseModel[]
  ): Record<FrequencyGroup, number> {
    return recurringExpenses.reduce(
      (total, curr) => {
        if (curr.disabled) {
          return total;
        }

        const group =
          curr.frequency === Frequency.MONTHLY
            ? FrequencyGroup.MONTHLY
            : FrequencyGroup.OTHERS;

        total[group] += curr.amount;

        return total;
      },
      { [FrequencyGroup.MONTHLY]: 0, [FrequencyGroup.OTHERS]: 0 }
    );
  }
}
