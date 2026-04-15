import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { getMessaging, TokenMessage } from "firebase-admin/messaging";
import {
  MessagingService,
  SendMessageRequest,
  SendMessageResponse,
} from "@/app/api/domain/shared/ports/messaging.interface";

@Injectable()
export class FcmMessagingService implements MessagingService {
  private readonly logPrefix = `[${FcmMessagingService.name}]`;

  /** FCM error codes that indicate the token is permanently invalid and should be removed. */
  private static readonly INVALID_TOKEN_CODES = new Set([
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
  ]);

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const messaging = getMessaging();

      const { notification, extraData, token } = request;
      const message: TokenMessage = {
        data: { ...notification, ...extraData },
        token,
      };

      const messageId = await messaging.send(message);

      return {
        messageId,
        success: true,
        token,
      };
    } catch (error) {
      return this.handleSendError(error, request.token);
    }
  }

  async sendMultipleMessages(
    requests: SendMessageRequest[]
  ): Promise<SendMessageResponse[]> {
    const results = await Promise.allSettled(
      requests.map((request) => this.sendMessage(request))
    );

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }

      return {
        messageId: "",
        success: false,
      };
    });
  }

  private handleSendError(error: unknown, token: string): SendMessageResponse {
    const code = (error as { code?: string }).code ?? "";
    const isTokenInvalid = FcmMessagingService.INVALID_TOKEN_CODES.has(code);

    if (isTokenInvalid) {
      console.warn(
        `${this.logPrefix} Stale FCM token detected (${code}):`,
        token
      );
    } else {
      console.error(`${this.logPrefix} Failed to send FCM message:`, error);
    }

    return {
      messageId: "",
      success: false,
      token,
      isTokenInvalid,
    };
  }
}
