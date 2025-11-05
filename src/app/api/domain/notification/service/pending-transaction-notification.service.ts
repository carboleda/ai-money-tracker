import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { NotificationService } from "./notification.service";
import { NotificationModel } from "../model/notification.model";
import {
  TransactionStatus,
  TransactionModel,
} from "@/app/api/domain/transaction/model/transaction.model";
import { Env } from "@/config/env";

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
    private readonly notificationService: NotificationService
  ) {}

  async execute(): Promise<PendingTransactionNotificationResult> {
    try {
      // FIXME Get the user (assuming single user system based on original implementation)
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

      const notifications = transactionsToNotify.map((transaction) => {
        const notification = this.createNotificationForTransaction(
          now,
          transaction
        );
        return {
          userId: user.id,
          fcmToken: user.fcmToken,
          notification,
        };
      });

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

  private createNotificationForTransaction(
    now: Date,
    transaction: TransactionModel
  ): NotificationModel {
    const createdAt = transaction.createdAt;
    const daysDifference = Math.abs(this.dateDiffInDays(now, createdAt));

    if (createdAt <= now) {
      // Overdue payment
      const dueText =
        daysDifference === 0 ? "today" : `${daysDifference} days ago`;
      return new NotificationModel({
        title: "[ACTION REQUIRED]: Payment due",
        body: `Payment for ${transaction.description} is due ${dueText}, pay it ASAP.`,
        extraData: {
          transactionId: transaction.id,
        },
      });
    }

    // Upcoming payment reminder
    return new NotificationModel({
      title: "[REMINDER]: Payment will be due soon",
      body: `Payment for ${transaction.description} is due on ${this.formatDate(
        createdAt
      )}.`,
      extraData: {
        transactionId: transaction.id,
      },
    });
  }

  private dateDiffInDays(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
