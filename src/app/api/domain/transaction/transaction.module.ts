import { container } from "tsyringe";
import { GenerateTransactionService } from "./service/generate-transaction.service";
import { CreateTransactionService } from "./service/create-transaction.service";
import { UpdateTransactionService } from "./service/update-transaction.service";
import { DeleteTransactionService } from "./service/delete-transaction.service";
import { FilterTransactionsService } from "./service/filter-transactions.service";

export class TransactionModule {
  static register(): void {
    // Register services
    container.register(GenerateTransactionService, {
      useClass: GenerateTransactionService,
    });

    container.register(CreateTransactionService, {
      useClass: CreateTransactionService,
    });

    container.register(UpdateTransactionService, {
      useClass: UpdateTransactionService,
    });

    container.register(DeleteTransactionService, {
      useClass: DeleteTransactionService,
    });

    container.register(FilterTransactionsService, {
      useClass: FilterTransactionsService,
    });
  }
}
