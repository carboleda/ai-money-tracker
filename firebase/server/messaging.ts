import {
  getMessaging,
  TokenMessage,
  Notification,
} from "firebase-admin/messaging";

export type DataNotification = {
  notification: Notification;
  extraData?: Record<string, string>;
};

export const sendMessage = async (
  fcmToken: string,
  { notification, extraData }: DataNotification
) => {
  try {
    const message: TokenMessage = {
      data: { ...notification, ...extraData },
      token: fcmToken,
    };

    return getMessaging().send(message);
  } catch (error) {
    return Promise.reject((error as Error).message);
  }
};
