import { container } from "tsyringe";
import { GetAllAccountsService } from "./service/get-all.service";
import { CreateAccountService } from "./service/create-account.service";
import { UpdateAccountService } from "./service/update-account.service";
import { DeleteAccountService } from "./service/delete-account.service";
import { ValidateAccountService } from "./service/validate-account.service";
import { AccountEventsService } from "./service/account-events.service";
import { registerEventHandlers } from "@/app/api/decorators/tsyringe.decorator";

export class AccountModule {
  static register(): void {
    // Register services
    container.register(GetAllAccountsService, {
      useClass: GetAllAccountsService,
    });

    container.register(CreateAccountService, {
      useClass: CreateAccountService,
    });

    container.register(UpdateAccountService, {
      useClass: UpdateAccountService,
    });

    container.register(DeleteAccountService, {
      useClass: DeleteAccountService,
    });

    container.register(ValidateAccountService, {
      useClass: ValidateAccountService,
    });

    // Register and initialize AccountEventsService to set up event listeners
    container.register(AccountEventsService, {
      useClass: AccountEventsService,
    });

    // Initialize AccountEventsService and register event handlers
    const accountEventsService = container.resolve(AccountEventsService);
    registerEventHandlers(accountEventsService);
  }
}
