import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { NotificationService } from "./notification.service";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { EmailStrategy } from "@/app/api/domain/user/model/user.model";
import { Env } from "@/config/env";
import { StandaloneNotificationStrategy } from "../strategy/standalone-notification.strategy";
import { DigestNotificationStrategy } from "../strategy/digest-notification.strategy";

export interface PendingTransactionNotificationResult {
  processedTransactions?: number;
  notificationsSent?: number;
  notificationsFailed?: number;
  success: boolean;
}

@Injectable()
export class PendingTransactionNotificationService {
  private readonly logPrefix = `[${PendingTransactionNotificationService.name}]`;

  constructor(
    private readonly filterTransactionsService: FilterTransactionsService,
    private readonly getUserService: GetUserService,
    private readonly notificationService: NotificationService,
    private readonly standaloneNotificationStrategy: StandaloneNotificationStrategy,
    private readonly digestNotificationStrategy: DigestNotificationStrategy
  ) {}

  async execute(): Promise<PendingTransactionNotificationResult> {
    try {
      const user = await this.getUserService.execute();
      if (!user) {
        console.log(`${this.logPrefix} No user found for notifications`);
        return { success: false };
      }

      // Fetch pending transactions
      const transactions = await this.filterTransactionsService.execute({
        status: TransactionStatus.PENDING,
      });
      if (!transactions.length) {
        console.log(
          `${this.logPrefix} No pending transactions found for notifications`
        );
        return { success: true, processedTransactions: 0 };
      }

      const now = new Date();
      const earlyReminderDate = new Date();
      earlyReminderDate.setDate(now.getDate() + Env.EARLY_REMINDER_DAYS_AHEAD);

      const transactionsToNotify = transactions.filter((transaction) => {
        const createdAt = transaction.createdAt;
        return createdAt <= now || earlyReminderDate >= createdAt;
      });

      if (!transactionsToNotify.length) {
        console.log(
          `${this.logPrefix} No transactions meet notification criteria`
        );
        return { success: true, processedTransactions: transactions.length };
      }

      const strategy =
        (user.settings?.emailStrategy ?? EmailStrategy.STANDALONE) ===
        EmailStrategy.DIGEST
          ? this.digestNotificationStrategy
          : this.standaloneNotificationStrategy;

      const notificationsToSend = strategy.buildNotifications(
        transactionsToNotify,
        now
      );

      const notifications = notificationsToSend.flatMap((notification) => {
        user.devices = user.devices || [];
        return user.devices
          .filter((device) => device.fcmToken)
          .map((device) => ({
            userId: user.id,
            fcmToken: device.fcmToken!,
            notification,
          }));
      });

      console.log(
        `${this.logPrefix} Prepared ${notifications.length} notifications`,
        notifications
      );

      // Send bulk notifications
      const bulkResult = await this.notificationService.sendBulkNotifications(
        notifications
      );

      console.log(
        `${this.logPrefix} Processed ${transactions.length} transactions, sent ${bulkResult.successful} notifications, ${bulkResult.failed} failed`
      );

      return {
        processedTransactions: transactions.length,
        notificationsSent: bulkResult.successful,
        notificationsFailed: bulkResult.failed,
        success: true,
      };
    } catch (error) {
      console.error(
        `${this.logPrefix} Failed to process pending transaction notifications:`,
        error
      );
      return { success: false };
    }
  }

}
