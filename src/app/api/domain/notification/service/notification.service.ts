import { Injectable, Inject } from "@/app/api/decorators/tsyringe.decorator";
import type {
  MessagingService,
  SendMessageRequest,
} from "@/app/api/domain/shared/ports/messaging.interface";
import { NotificationModel } from "../model/notification.model";
import { NullifyStaleTokensService } from "@/app/api/domain/user/service/nullify-stale-tokens.service";

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BulkNotificationResult {
  totalSent: number;
  successful: number;
  failed: number;
  results: NotificationResult[];
}

@Injectable()
export class NotificationService {
  private readonly logPrefix = `[${NotificationService.name}]`;

  constructor(
    @Inject("MessagingService")
    private readonly messagingService: MessagingService,
    private readonly nullifyStaleTokensService: NullifyStaleTokensService,
  ) {}

  async sendNotification(
    userId: string,
    fcmToken: string,
    notification: NotificationModel,
  ): Promise<NotificationResult> {
    try {
      const response = await this.messagingService.sendMessage({
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        extraData: notification.extraData,
      });

      if (response.isTokenInvalid && response.token) {
        await this.nullifyStaleTokensService.execute([response.token]);
      }

      return {
        success: response.success,
        messageId: response.messageId,
      };
    } catch (error) {
      console.error(
        `${this.logPrefix} Failed to send notification to user ${userId}:`,
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendBulkNotifications(
    notifications: Array<{
      userId: string;
      fcmToken: string;
      notification: NotificationModel;
    }>,
  ): Promise<BulkNotificationResult> {
    const requests = notifications.map(
      (item): SendMessageRequest => ({
        token: item.fcmToken,
        notification: {
          title: item.notification.title,
          body: item.notification.body,
        },
        extraData: item.notification.extraData,
      }),
    );

    const responses =
      await this.messagingService.sendMultipleMessages(requests);

    // Collect all permanently-invalid tokens and clean them up in one batch.
    const staleTokens = responses
      .filter((r) => r.isTokenInvalid && r.token)
      .map((r) => r.token as string);

    if (staleTokens.length) {
      console.log(
        `${this.logPrefix} Scheduling cleanup for ${staleTokens.length} stale token(s).`,
      );
      await this.nullifyStaleTokensService.execute(staleTokens);
    }

    const results: NotificationResult[] = responses.map((response) => ({
      success: response.success,
      messageId: response.messageId,
    }));

    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;

    return {
      totalSent: results.length,
      successful,
      failed,
      results,
    };
  }
}
