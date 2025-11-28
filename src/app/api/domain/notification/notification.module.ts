import { container } from "tsyringe";
import { NotificationService } from "./service/notification.service";
import { PendingTransactionNotificationService } from "./service/pending-transaction-notification.service";

export class NotificationModule {
  static register(): void {
    // Register notification services
    container.register(NotificationService, { useClass: NotificationService });
    container.register(PendingTransactionNotificationService, {
      useClass: PendingTransactionNotificationService,
    });
  }
}
