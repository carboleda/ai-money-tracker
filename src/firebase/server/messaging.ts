import {
  getMessaging,
  TokenMessage,
  Notification,
} from "firebase-admin/messaging";

export type DataNotification = {
  notification: Notification;
  extraData?: Record<string, string>;
};

/**
 * Prevent the app from displaying notification twice
 * https://stackoverflow.com/a/67917507/3167601
 * @param fcmToken
 * @param dataNotification
 * @returns
 */
export const sendMessage = async (
  fcmToken: string,
  dataNotification: DataNotification
) => {
  try {
    const { notification, extraData } = dataNotification;
    const message: TokenMessage = {
      data: { ...notification, ...extraData },
      token: fcmToken,
    };

    return getMessaging().send(message);
  } catch (error) {
    return Promise.reject((error as Error).message);
  }
};
