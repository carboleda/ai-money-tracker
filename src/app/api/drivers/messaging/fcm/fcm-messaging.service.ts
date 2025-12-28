import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { getMessaging, TokenMessage } from "firebase-admin/messaging";
import {
  MessagingService,
  SendMessageRequest,
  SendMessageResponse,
} from "@/app/api/domain/shared/interfaces/messaging.interface";

@Injectable()
export class FcmMessagingService implements MessagingService {
  private readonly logPrefix = `[${FcmMessagingService.name}]`;

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
      };
    } catch (error) {
      console.error(`${this.logPrefix} Failed to send FCM message:`, error);
      return {
        messageId: "",
        success: false,
      };
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
}
