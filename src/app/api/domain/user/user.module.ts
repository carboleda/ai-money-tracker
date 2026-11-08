import { container } from "tsyringe";
import { UpsertUserService } from "./service/upsert-user.service";
import { GetUserService } from "./service/get-user.service";
import { NullifyStaleTokensService } from "./service/nullify-stale-tokens.service";
import { UpdateUserSettingsService } from "./service/update-user-settings.service";

export class UserModule {
  static register(): void {
    // Register services
    container.register(UpsertUserService, {
      useClass: UpsertUserService,
    });

    container.register(GetUserService, {
      useClass: GetUserService,
    });

    container.register(NullifyStaleTokensService, {
      useClass: NullifyStaleTokensService,
    });

    container.register(UpdateUserSettingsService, {
      useClass: UpdateUserSettingsService,
    });
  }
}
