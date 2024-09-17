"use client";

import { ReactNode, useEffect, useRef } from "react";
import { FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  MessagePayload,
  onMessage,
} from "firebase/messaging";
import * as env from "@/config/env";
import { useMutateUser } from "@/hooks/useMutateUser";

interface FcmProviderProps {
  firebaseApp?: FirebaseApp;
  children: ReactNode;
}

const FcmProviderServer: React.FC<FcmProviderProps> = ({
  firebaseApp,
  children,
}) => {
  return <>{children}</>;
};

const FcmProviderFrontend: React.FC<FcmProviderProps> = ({
  firebaseApp,
  children,
}) => {
  const isTokenRegistered = useRef(false);
  const messaging = getMessaging(firebaseApp);
  const { isMutating, updateUser } = useMutateUser();

  useEffect(() => {
    if (isMutating || isTokenRegistered.current) return;

    console.log("Requesting permission...");
    isTokenRegistered.current = true;
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log(
            "Notification permission granted.",
            env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          );
          return getToken(messaging, {
            vapidKey: env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
        } else {
          throw new Error("Permission denied.");
        }
      })
      .then((fcmToken) => {
        console.log(fcmToken);
        return updateUser({ fcmToken });
      })
      .then(() => {
        console.log("Setting up onMessage handler...");
        onMessage(messaging, (payload: MessagePayload) => {
          console.log("[UI] Message received. ", payload);
          const { title = "New message", body } = payload.notification ?? {};
          console.log("Creating new notification");
          new Notification(title, {
            body,
          });
        });
      })
      .catch((error) => {
        isTokenRegistered.current = false;
        console.error("Error getting token:", error);
      });
  }, [isMutating, updateUser, messaging]);

  return <>{children}</>;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  FcmProvider: env.isServer ? FcmProviderServer : FcmProviderFrontend,
};
