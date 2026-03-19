import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import type { UpdateRecurrentExpenseInput } from "../ports/inbound/update-recurrent-expense.port";
import { RecurrentExpenseMapper } from "../mapper/recurrent-expense.mapper";
import { Service } from "@/app/api/domain/shared/ports/service.interface";

@Injectable()
export class UpdateRecurrentExpenseService
  implements Service<UpdateRecurrentExpenseInput, void>
{
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(input: UpdateRecurrentExpenseInput): Promise<void> {
    if (!input.id) {
      throw new DomainError("Recurrent expense ID is required", 400);
    }

    this.validateRequiredFields(input);

    const model = RecurrentExpenseMapper.fromUpdateToModel(input);
    await this.recurrentExpenseRepository.update(model);
  }

  private validateRequiredFields(input: UpdateRecurrentExpenseInput) {
    if (
      !input.description ||
      !input.category ||
      !input.frequency ||
      !input.dueDate ||
      input.amount === null ||
      input.amount === undefined
    ) {
      throw new DomainError("Missing required fields", 400);
    }

    if (input.amount <= 0) {
      throw new DomainError("Amount must be greater than 0", 400);
    }
  }
}
