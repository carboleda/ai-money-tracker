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
}

export interface MessagingService {
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  sendMultipleMessages(
    requests: SendMessageRequest[]
  ): Promise<SendMessageResponse[]>;
}
