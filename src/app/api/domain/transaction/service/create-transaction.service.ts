import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionCreatedEvent,
} from "@/app/api/domain/interfaces/account-events.interface";
import { pubsub } from "@/app/api/helpers/pubsub";

@Injectable()
export class CreateTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(input: Omit<TransactionModel, "id">): Promise<string> {
    const id = await this.transactionRepository.create(input);

    await pubsub.emit(
      EventTypes.TRANSACTION_CREATED,
      new TransactionCreatedEvent({ ...input, id })
    );

    return id;
  }
}
