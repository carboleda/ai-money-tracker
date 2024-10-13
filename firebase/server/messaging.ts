import {
  getMessaging,
  TokenMessage,
  WebpushNotification,
} from "firebase-admin/messaging";

export const sendMessage = async (
  fcmToken: string,
  notification: WebpushNotification,
  data?: Record<string, string>
) => {
  try {
    const message: TokenMessage = {
      webpush: {
        notification,
        data,
      },
      token: fcmToken,
    };

    return getMessaging().send(message);
  } catch (error) {
    return Promise.reject((error as Error).message);
  }
};
