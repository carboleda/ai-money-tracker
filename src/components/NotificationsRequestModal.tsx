"use client";

import { useDisclosure } from "@heroui/modal";
import { Checkbox } from "@heroui/checkbox";
import { useEffect, useRef } from "react";
import { Env } from "@/config/env";
import { getMessaging, getToken } from "firebase/messaging";
import { FirebaseApp } from "firebase/app";
import { useMutateUser } from "@/hooks/useMutateUser";
import { Action, ConfirmationModal } from "./shared/ConfirmationModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

interface NotificationRequestModalProps {
  firebaseApp?: FirebaseApp;
  onPermissionGranted: () => void;
}

export const NotificationRequestModal: React.FC<
  NotificationRequestModalProps
> = ({ firebaseApp, onPermissionGranted }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { updateUser } = useMutateUser();
  const doNotAskAgainCheckox = useRef<HTMLInputElement>(null);
  const [doNotAskAgain, setDoNotAskAgain] = useLocalStorage(
    "doNotAskAgain",
    false
  );
  const permission = Env.isServer ? "granted" : Notification.permission;

  useEffect(() => {
    if (permission !== "granted" && !doNotAskAgain) {
      onOpen();
    }
  }, [permission, doNotAskAgain, onOpen]);

  const onAction = async (action: Action) => {
    try {
      onClose();

      if (action !== Action.Yes) {
        setDoNotAskAgain(doNotAskAgainCheckox.current?.checked!);
        if (doNotAskAgainCheckox.current?.checked) {
          location.reload();
        }
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const messaging = getMessaging(firebaseApp);
        const fcmToken = await getToken(messaging, {
          vapidKey: Env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        await updateUser({ fcmToken });

        onPermissionGranted();
      } else {
        alert("You need to accept the request to receive notifications.");
      }
    } catch (error) {
      console.error("Error getting token:", error);
      alert((error as Error).message);
    }
  };

  return (
    <>
      <ConfirmationModal
        title={t("notificationsRequest.title")}
        isOpen={isOpen}
        onAction={onAction}
      >
        <p>{t("notificationsRequest.description")}</p>
        <ul>
          <li>◦ {t("notificationsRequest.reminderOverduePayments")}</li>
          <li>◦ {t("notificationsRequest.reminderBillsPayments")}</li>
          <li>◦ {t("notificationsRequest.neverMissPayment")}</li>
        </ul>

        <Checkbox ref={doNotAskAgainCheckox}>
          {t("notificationsRequest.doNotAskAgain")}
        </Checkbox>
      </ConfirmationModal>
    </>
  );
};
