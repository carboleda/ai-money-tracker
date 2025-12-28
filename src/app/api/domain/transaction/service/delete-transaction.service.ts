import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionDeletedEvent,
} from "@/app/api/domain/interfaces/account-events.interface";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { pubsub } from "@/app/api/helpers/pubsub";

@Injectable()
export class DeleteTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(id: string): Promise<void> {
    const transaction = await this.transactionRepository.getById(id);
    if (!transaction) {
      throw new DomainError("Transaction not found", 404);
    }

    await this.transactionRepository.delete(id);
    await pubsub.emit(
      EventTypes.TRANSACTION_DELETED,
      new TransactionDeletedEvent(transaction)
    );
  }
}
