import { getMessaging, Message, Notification } from "firebase-admin/messaging";

export const sendMessage = async (
  fcmToken: string,
  notification: Notification,
  data?: Record<string, string>
) => {
  const message: Message = {
    notification,
    data,
    token: fcmToken,
  };

  return getMessaging().send(message);
};
