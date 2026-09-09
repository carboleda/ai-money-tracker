import { container } from "tsyringe";
import { NotificationService } from "./service/notification.service";
import { PendingTransactionNotificationService } from "./service/pending-transaction-notification.service";
import { StandaloneNotificationStrategy } from "./strategy/standalone-notification.strategy";
import { DigestNotificationStrategy } from "./strategy/digest-notification.strategy";

export class NotificationModule {
  static register(): void {
    // Register notification services
    container.register(NotificationService, { useClass: NotificationService });
    container.register(PendingTransactionNotificationService, {
      useClass: PendingTransactionNotificationService,
    });
    container.register(StandaloneNotificationStrategy, {
      useClass: StandaloneNotificationStrategy,
    });
    container.register(DigestNotificationStrategy, {
      useClass: DigestNotificationStrategy,
    });
  }
}
