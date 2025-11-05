import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionUpdatedEvent,
} from "@/app/api/domain/interfaces/account-events.interface";
import { DomainError } from "@/app/api/domain/errors/domain.error";
import { pubsub } from "@/app/api/helpers/pubsub";

@Injectable()
export class UpdateTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(transaction: TransactionModel): Promise<void> {
    const oldTransaction = await this.transactionRepository.getById(
      transaction.id
    );
    if (!oldTransaction) {
      throw new DomainError("Transaction not found", 404);
    }

    await this.transactionRepository.update(transaction);
    await pubsub.emit(
      EventTypes.TRANSACTION_UPDATED,
      new TransactionUpdatedEvent(oldTransaction, transaction)
    );
  }
}
