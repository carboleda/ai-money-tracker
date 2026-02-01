import type { TransactionRepository } from "../repository/transaction.repository";
import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "../model/transaction.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import {
  EventTypes,
  TransactionCreatedEvent,
} from "@/app/api/domain/shared/interfaces/account-events.interface";
import { pubsub } from "@/app/api/helpers/pubsub";
import { ValidateAccountService } from "@/app/api/domain/account/service/validate-account.service";
import { ValidateCategoryService } from "@/app/api/domain/category/service/validate-category.service";
import { CreateTransactionInput } from "../ports/inbound/create-transaction.port";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { TransactionMapper } from "../mapper/transaction.mapper";
import { GetAllCategoriesService } from "@/app/api/domain/category/service/get-all-categories.service";

@Injectable()
export class CreateTransactionService
  implements Service<CreateTransactionInput, string>
{
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository,
    private readonly getAllCategoriesService: GetAllCategoriesService,
    private readonly validateAccountService: ValidateAccountService,
    private readonly validateCategoryService: ValidateCategoryService
  ) {}

  async execute(transaction: CreateTransactionInput): Promise<string> {
    // Validate that TRANSFER has destinationAccount
    if (
      transaction.type === TransactionType.TRANSFER &&
      !transaction.destinationAccount
    ) {
      throw new Error("Transfer transactions must have a destinationAccount");
    }

    // Validate accounts exist and are not deleted
    if (transaction.status != TransactionStatus.PENDING) {
      await this.validateAccountService.execute({
        sourceAccount: transaction.sourceAccount,
        destinationAccount: transaction.destinationAccount,
      });
    }

    // Get all categories (predefined + custom merged)
    const categories = await this.getAllCategoriesService.execute();

    // Validate category if provided
    if (transaction.category) {
      await this.validateCategoryService.execute({
        categories,
        categoryRef: transaction.category,
        transactionType: transaction.type,
      });
    }

    const transactionModel = TransactionMapper.fromCreateToModel(transaction);
    const id = await this.transactionRepository.create(transactionModel);

    await pubsub.emit(
      EventTypes.TRANSACTION_CREATED,
      new TransactionCreatedEvent({ ...transactionModel, id })
    );

    return id;
  }
}
