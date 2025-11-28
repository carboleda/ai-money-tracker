import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import { RecurrentExpenseModel, Frequency, FrequencyGroup } from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";

@Injectable()
export class GetAllRecurrentExpensesService {
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(): Promise<{
    recurringExpenses: RecurrentExpenseModel[];
    groupTotal: Record<FrequencyGroup, number>;
  }> {
    const recurringExpenses = await this.recurrentExpenseRepository.getAll();
    const groupTotal = this.getGroupedTotal(recurringExpenses);

    return { recurringExpenses, groupTotal };
  }

  private getGroupedTotal(
    recurringExpenses: RecurrentExpenseModel[]
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
