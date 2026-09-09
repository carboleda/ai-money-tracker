import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { NotificationModel } from "../model/notification.model";
import { NotificationStrategy } from "./notification-strategy.interface";
import { classifyTransaction, formatDate } from "./transaction-notification-classifier";

@Injectable()
export class StandaloneNotificationStrategy implements NotificationStrategy {
  buildNotifications(
    transactions: TransactionModel[],
    now: Date
  ): NotificationModel[] {
    console.log(
      `[${StandaloneNotificationStrategy.name}] Using Standalone strategy to build notifications for ${transactions.length} transactions`,
    );
    return transactions.map((transaction) =>
      this.createNotificationForTransaction(now, transaction)
    );
  }

  private createNotificationForTransaction(
    now: Date,
    transaction: TransactionModel
  ): NotificationModel {
    const createdAt = transaction.createdAt;
    const { isOverdue, daysDifference, hoursDifference } = classifyTransaction(
      now,
      transaction
    );

    if (isOverdue) {
      const dueText =
        hoursDifference <= 24 ? "today" : `${daysDifference} days ago`;
      return new NotificationModel({
        title: "[ACTION REQUIRED]: Payment due",
        body: `Payment for ${transaction.description} is due ${dueText}, pay it ASAP.`,
        extraData: {
          transactionId: transaction.id!,
        },
      });
    }

    return new NotificationModel({
      title: "[REMINDER]: Payment will be due soon",
      body: `Payment for ${transaction.description} is due on ${formatDate(
        createdAt
      )}.`,
      extraData: {
        transactionId: transaction.id!,
      },
    });
  }
}
