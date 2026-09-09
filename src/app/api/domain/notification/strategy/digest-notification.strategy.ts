import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { NotificationModel } from "../model/notification.model";
import { NotificationStrategy } from "./notification-strategy.interface";
import { classifyTransaction } from "./transaction-notification-classifier";

@Injectable()
export class DigestNotificationStrategy implements NotificationStrategy {
  buildNotifications(
    transactions: TransactionModel[],
    now: Date
  ): NotificationModel[] {
    console.log(
      `[${DigestNotificationStrategy.name}] Using Digest strategy to build notifications for ${transactions.length} transactions`,
    );
    const { overdueCount, upcomingCount } = transactions.reduce(
      (counts, transaction) => {
        const { isOverdue } = classifyTransaction(now, transaction);
        return isOverdue
          ? { ...counts, overdueCount: counts.overdueCount + 1 }
          : { ...counts, upcomingCount: counts.upcomingCount + 1 };
      },
      { overdueCount: 0, upcomingCount: 0 }
    );

    const parts = [
      overdueCount > 0 ? `${overdueCount} overdue` : null,
      upcomingCount > 0 ? `${upcomingCount} upcoming` : null,
    ].filter(Boolean);

    return [
      new NotificationModel({
        title: "[DIGEST]: Pending payments",
        body: `You have ${parts.join(" and ")} payments.`,
        extraData: {
          type: "digest",
          overdueCount: String(overdueCount),
          upcomingCount: String(upcomingCount),
        },
      }),
    ];
  }
}
