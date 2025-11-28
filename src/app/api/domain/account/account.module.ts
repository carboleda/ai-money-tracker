import { container } from "tsyringe";
import { UpdateAccountBalanceService } from "./service/update-account-balance.service";
import { GetAllAccountsService } from "./service/get-all.service";
import { AccountEventsService } from "./service/account-events.service";
import { registerEventHandlers } from "@/app/api/decorators/tsyringe.decorator";

export class AccountModule {
  static register(): void {
    // Register services
    container.register(UpdateAccountBalanceService, {
      useClass: UpdateAccountBalanceService,
    });

    container.register(GetAllAccountsService, {
      useClass: GetAllAccountsService,
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
