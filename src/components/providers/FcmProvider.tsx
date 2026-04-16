"use client";

import { useEffect, useRef, PropsWithChildren } from "react";
import { FirebaseApp } from "firebase/app";
import {
  getMessaging,
  MessagePayload,
  onMessage,
  getToken,
} from "firebase/messaging";
import { NotificationRequestModal } from "@/components/NotificationsRequestModal";
import { Env } from "@/config/env";
import { DeviceInfo } from "@/config/deviceInfo";
import { useMutateUser } from "@/hooks/useMutateUser";
import { useGetUser } from "@/hooks/useGetUser";

interface FcmProviderProps extends PropsWithChildren {
  firebaseApp?: FirebaseApp;
}

const FcmProviderFrontend: React.FC<FcmProviderProps> = ({
  firebaseApp,
  children,
}) => {
  const { updateUser } = useMutateUser();
  const { user, isLoading } = useGetUser();
  // Tracks whether the one-time token refresh for this mount has already run,
  // preventing re-execution when SWR revalidates and updates `user`.
  const tokenRefreshed = useRef(false);

  // Silently refresh the FCM token once per app load when permission is already
  // granted. On iOS/Safari the APNs-backed token expires after a few days; this
  // ensures the stored token in Firestore always stays current without ever
  // prompting the user again.
  useEffect(() => {
    // Wait until SWR has resolved the user profile before comparing tokens.
    // Bail out if the refresh has already run this mount.
    if (isLoading || tokenRefreshed.current) return;
    if (Notification.permission !== "granted" || !firebaseApp) return;

    tokenRefreshed.current = true;

    const refreshToken = async () => {
      try {
        const messaging = getMessaging(firebaseApp);
        const [freshToken, { deviceId, deviceName }] = await Promise.all([
          getToken(messaging, { vapidKey: Env.NEXT_PUBLIC_FIREBASE_VAPID_KEY }),
          DeviceInfo.generate(),
        ]);

        if (!freshToken) return;

        // Only write to Firestore when the token has actually changed.
        const storedDevice = user?.devices?.find(
          (d) => d.deviceId === deviceId
        );

        if (storedDevice?.fcmToken === freshToken) return;

        await updateUser({
          devices: [{ deviceId, deviceName, fcmToken: freshToken }],
        });
      } catch (error) {
        // Non-critical background operation — log but never throw.
        console.warn("[FcmProvider] Silent token refresh failed:", error);
      }
    };

    refreshToken();
  // `user` is intentionally included so we have the resolved data available
  // for comparison, but `tokenRefreshed` guards against re-running.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, firebaseApp, user]);

  const onPermissionGranted = () => {
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging, (payload: MessagePayload) => {
      const { title = "New message", body } = payload.notification ?? {};
      new Notification(title, {
        body,
      });
    });
  };

  if (typeof globalThis === "undefined" || !("Notification" in globalThis)) {
    return <>{children}</>;
  }

  return (
    <>
      <NotificationRequestModal
        firebaseApp={firebaseApp}
        onPermissionGranted={onPermissionGranted}
      />
      {children}
    </>
  );
};

export default FcmProviderFrontend;
