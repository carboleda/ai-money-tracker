import { FirebaseApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { DeviceInfo } from "@/config/deviceInfo";
import { Env } from "@/config/env";

export interface FcmDeviceToken {
  deviceId: string;
  deviceName: string;
  fcmToken: string;
}

/**
 * Resolves the current device's FCM registration token, or null when
 * Firebase Messaging isn't supported (e.g. Safari without push permission
 * plumbing, or no service worker registration yet).
 */
export async function requestFcmToken(
  firebaseApp?: FirebaseApp
): Promise<FcmDeviceToken | null> {
  if (!firebaseApp || !(await isSupported())) return null;

  const messaging = getMessaging(firebaseApp);
  const [registration, { deviceId, deviceName }] = await Promise.all([
    navigator.serviceWorker.ready,
    DeviceInfo.generate(),
  ]);
  const fcmToken = await getToken(messaging, {
    vapidKey: Env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return fcmToken ? { deviceId, deviceName, fcmToken } : null;
}
