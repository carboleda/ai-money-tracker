"use client";

import { useOverlayState } from "@heroui/react";
import { useEffect } from "react";
import { Env } from "@/config/env";
import { FirebaseApp } from "firebase/app";
import { requestFcmToken } from "@/firebase/client/messaging";
import { useMutateUser } from "@/hooks/useMutateUser";
import { Action, ConfirmationModal } from "./ConfirmationModal";
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
  const { isOpen, open, close } = useOverlayState();
  const { updateUser } = useMutateUser();
  const [doNotAskAgain, setDoNotAskAgain] = useLocalStorage(
    "doNotAskAgain",
    false,
  );
  const permission = Env.isServer ? "granted" : Notification.permission;

  useEffect(() => {
    if (permission !== "granted" && !doNotAskAgain) {
      open();
    }
  }, [permission, doNotAskAgain, open]);

  const onAction = async (action: Action, doNotAskAgainChecked: boolean) => {
    try {
      close();

      if (action !== Action.Yes) {
        setDoNotAskAgain(doNotAskAgainChecked);
        if (doNotAskAgainChecked) {
          location.reload();
        }
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const device = await requestFcmToken(firebaseApp);
        if (!device) {
          alert(t("requestDenied"));
          return;
        }

        await updateUser({ devices: [device] });

        onPermissionGranted();
      } else {
        alert(t("requestDenied"));
      }
    } catch (error) {
      console.error("Error getting token:", error);
      alert((error as Error).message);
    }
  };

  return (
    <ConfirmationModal
      title={t("notificationsRequest.title")}
      isOpen={isOpen}
      onAction={onAction}
    >
      <p>{t("notificationsRequest.description")}</p>
      <ul>
        <li>⚠️ {t("notificationsRequest.reminderOverduePayments")}</li>
        <li>🔔 {t("notificationsRequest.reminderBillsPayments")}</li>
        <li>📅 {t("notificationsRequest.neverMissPayment")}</li>
      </ul>
    </ConfirmationModal>
  );
};
