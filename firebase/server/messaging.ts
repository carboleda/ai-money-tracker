import { getMessaging, Message, Notification } from "firebase-admin/messaging";

export const sendMessage = async (
  fcmToken: string,
  notification: Notification,
  data?: Record<string, string>
) => {
  try {
    const message: Message = {
      notification,
      data,
      token: fcmToken,
    };

    return getMessaging().send(message);
  } catch (error) {
    return Promise.reject((error as Error).message);
  }
};
