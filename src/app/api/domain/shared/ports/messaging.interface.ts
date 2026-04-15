export interface NotificationPayload {
  title: string;
  body: string;
}

export interface MessageData {
  [key: string]: string;
}

export interface SendMessageRequest {
  token: string;
  notification: NotificationPayload;
  extraData?: MessageData;
}

export interface SendMessageResponse {
  messageId: string;
  success: boolean;
  /** The FCM token that was used for this send attempt. */
  token?: string;
  /** True when FCM rejected the token as permanently invalid (e.g. app uninstalled, token rotated). */
  isTokenInvalid?: boolean;
}

export interface MessagingService {
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  sendMultipleMessages(
    requests: SendMessageRequest[]
  ): Promise<SendMessageResponse[]>;
}
