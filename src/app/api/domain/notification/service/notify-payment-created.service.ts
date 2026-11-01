import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { GetUserService } from "@/app/api/domain/user/service/get-user.service";
import { NotificationService } from "./notification.service";
import { NotificationModel } from "../model/notification.model";
import { NotifyPaymentCreatedInput } from "../ports/inbound/notify-payment-created.port";

@Injectable()
export class NotifyPaymentCreatedService implements Service<
  NotifyPaymentCreatedInput,
  void
> {
  private readonly logPrefix = `[${NotifyPaymentCreatedService.name}]`;

  constructor(
    private readonly getUserService: GetUserService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(input: NotifyPaymentCreatedInput): Promise<void> {
    try {
      const user = await this.getUserService.execute();
      if (!user) {
        console.log(`${this.logPrefix} No user found, skipping notification`);
        return;
      }

      if (user.settings?.paymentNotificationsEnabled === false) {
        console.log(
          `${this.logPrefix} User opted out of payment notifications`,
        );
        return;
      }

      const devices = (user.devices ?? []).filter((device) => device.fcmToken);
      if (!devices.length) {
        console.log(`${this.logPrefix} No devices with fcmToken found`);
        return;
      }

      const notification = new NotificationModel({
        title: "Payment recorded through your Apple Wallet integration",
        body: `You paid ${input.amount} for ${input.description}`,
        extraData: { transactionId: input.transactionId },
      });

      const result = await this.notificationService.sendBulkNotifications(
        devices.map((device) => ({
          userId: user.id,
          fcmToken: device.fcmToken!,
          notification,
        })),
      );

      console.log(
        `${this.logPrefix} Sent ${result.successful}/${result.totalSent} payment-created notifications`,
      );
    } catch (error) {
      console.error(
        `${this.logPrefix} Failed to notify payment created:`,
        error,
      );
    }
  }
}
