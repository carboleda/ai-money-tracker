import { container } from "tsyringe";
import { UpsertFcmTokenService } from "./service/upsert-fcmtoken.service";
import { GetUserService } from "./service/get-user.service";

export class UserModule {
  static register(): void {
    // Register services
    container.register(UpsertFcmTokenService, {
      useClass: UpsertFcmTokenService,
    });

    container.register(GetUserService, {
      useClass: GetUserService,
    });
  }
}
