import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import {
  RecurrentExpenseModel,
  Frequency,
  FrequencyGroup,
} from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import type { GetRecurrentExpensesOutput } from "../ports/outbound/get-recurrent-expenses.port";
import { RecurrentExpenseMapper } from "../mapper/recurrent-expense.mapper";
import { Service } from "@/app/api/domain/shared/ports/service.interface";

@Injectable()
export class GetAllRecurrentExpensesService
  implements Service<void, GetRecurrentExpensesOutput>
{
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(): Promise<GetRecurrentExpensesOutput> {
    const recurringExpenses = await this.recurrentExpenseRepository.getAll();
    const groupTotal = this.getGroupedTotal(recurringExpenses);
    const recurringExpensesConfig = recurringExpenses.map(
      RecurrentExpenseMapper.toOutputPort
    );

    return { recurringExpensesConfig, groupTotal };
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
