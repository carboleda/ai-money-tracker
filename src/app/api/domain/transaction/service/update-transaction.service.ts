import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel, TransactionType } from "../model/transaction.model";
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
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";

@Injectable()
export class UpdateTransactionService {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly validateAccountService: ValidateAccountService
  ) {}

  async execute(transaction: TransactionModel): Promise<void> {
    const oldTransaction = await this.transactionRepository.getById(
      transaction.id
    );
    if (!oldTransaction) {
      throw new DomainError("Transaction not found", 404);
    }

    // Validate that TRANSFER has destinationAccount
    if (
      transaction.type === TransactionType.TRANSFER &&
      !transaction.destinationAccount
    ) {
      throw new Error("Transfer transactions must have a destinationAccount");
    }

    // Validate accounts exist and are not deleted
    await this.validateAccountService.execute(
      transaction.sourceAccount.ref,
      transaction.destinationAccount?.ref
    );

    await this.transactionRepository.update(transaction);
    await pubsub.emit(
      EventTypes.TRANSACTION_UPDATED,
      new TransactionUpdatedEvent(oldTransaction, transaction)
    );
  }
}
