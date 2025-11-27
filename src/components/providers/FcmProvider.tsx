"use client";

import { PropsWithChildren } from "react";
import { FirebaseApp } from "firebase/app";
import { getMessaging, MessagePayload, onMessage } from "firebase/messaging";
import { NotificationRequestModal } from "@/components/NotificationsRequestModal";

interface FcmProviderProps extends PropsWithChildren {
  firebaseApp?: FirebaseApp;
}

const FcmProviderFrontend: React.FC<FcmProviderProps> = ({
  firebaseApp,
  children,
}) => {
  if (typeof globalThis === "undefined" || !("Notification" in globalThis)) {
    return <>{children}</>;
  }

  const onPermissionGranted = () => {
    const messaging = getMessaging(firebaseApp);
    // console.log("Setting up onMessage handler...");
    onMessage(messaging, (payload: MessagePayload) => {
      // console.log("[UI] Message received. ", payload);
      const { title = "New message", body } = payload.notification ?? {};
      // console.log("Creating new notification");
      new Notification(title, {
        body,
      });
    });
  };

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
