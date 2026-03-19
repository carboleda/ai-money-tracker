import type { RecurrentExpenseRepository } from "../repository/recurrent-expense.repository";
import { RecurrentExpenseModel } from "../model/recurrent-expense.model";
import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import type { CreateRecurrentExpenseInput } from "../ports/inbound/create-recurrent-expense.port";
import { RecurrentExpenseMapper } from "../mapper/recurrent-expense.mapper";
import { Service } from "@/app/api/domain/shared/ports/service.interface";

@Injectable()
export class CreateRecurrentExpenseService
  implements Service<CreateRecurrentExpenseInput, string>
{
  constructor(
    @InjectRepository(RecurrentExpenseModel)
    private readonly recurrentExpenseRepository: RecurrentExpenseRepository
  ) {}

  async execute(input: CreateRecurrentExpenseInput): Promise<string> {
    this.validateRequiredFields(input);

    const model = RecurrentExpenseMapper.fromCreateToModel(input);
    const id = await this.recurrentExpenseRepository.create(model);

    return id;
  }

  private validateRequiredFields(input: CreateRecurrentExpenseInput) {
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
