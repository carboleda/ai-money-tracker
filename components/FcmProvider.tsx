"use client";

import { ReactNode } from "react";
import { FirebaseApp } from "firebase/app";
import { getMessaging, MessagePayload, onMessage } from "firebase/messaging";
import { NotificationRequestModal } from "./shared/NotificationsRequestModal";

interface FcmProviderProps {
  firebaseApp?: FirebaseApp;
  children: ReactNode;
}

const FcmProviderFrontend: React.FC<FcmProviderProps> = ({
  firebaseApp,
  children,
}) => {
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
