import type { TransactionRepository } from "../repository/transaction.repository";
import { TransactionModel, TransactionType } from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionUpdatedEvent,
} from "@/app/api/domain/shared/interfaces/account-events.interface";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";
import { pubsub } from "@/app/api/helpers/pubsub";
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";
import { ValidateCategoryService } from "@/app/api/domain/category/service/validate-category.service";
import { UpdateTransactionInput } from "../ports/inbound/update-transaction.port";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { TransactionMapper } from "../mapper/transaction.mapper";
import { GetAllCategoriesService } from "@/app/api/domain/category/service/get-all-categories.service";

@Injectable()
export class UpdateTransactionService implements Service<
  UpdateTransactionInput,
  void
> {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly getAllCategoriesService: GetAllCategoriesService,
    private readonly validateAccountService: ValidateAccountService,
    private readonly validateCategoryService: ValidateCategoryService,
  ) {}

  async execute(transaction: UpdateTransactionInput): Promise<void> {
    const oldTransaction = await this.transactionRepository.getById(
      transaction.id,
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
    await this.validateAccountService.execute({
      sourceAccount: transaction.sourceAccount,
      destinationAccount: transaction.destinationAccount,
    });

    // Validate category if provided
    if (transaction.category) {
      // Get all categories (predefined + custom merged)
      const categories = await this.getAllCategoriesService.execute();

      await this.validateCategoryService.execute({
        categories,
        categoryRef: transaction.category,
        transactionType: transaction.type,
      });
    }

    const transactionModel = TransactionMapper.fromUpdateToModel(transaction);
    await this.transactionRepository.update(transactionModel);

    await pubsub.emit(
      EventTypes.TRANSACTION_UPDATED,
      new TransactionUpdatedEvent(
        {
          ...oldTransaction,
        },
        { ...transactionModel },
      ),
    );
  }
}
