import { container } from "tsyringe";
import { UpsertUserService } from "./service/upsert-user.service";
import { GetUserService } from "./service/get-user.service";

export class UserModule {
  static register(): void {
    // Register services
    container.register(UpsertUserService, {
      useClass: UpsertUserService,
    });

    container.register(GetUserService, {
      useClass: GetUserService,
    });
  }
}
