import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { NotificationModel } from "../model/notification.model";

export interface NotificationStrategy {
  buildNotifications(
    transactions: TransactionModel[],
    now: Date
  ): NotificationModel[];
}
