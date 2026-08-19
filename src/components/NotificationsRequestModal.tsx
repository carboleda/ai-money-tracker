"use client";

import { Checkbox, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import { Env } from "@/config/env";
import { getMessaging, getToken } from "firebase/messaging";
import { FirebaseApp } from "firebase/app";
import { useMutateUser } from "@/hooks/useMutateUser";
import { Action, ConfirmationModal } from "./shared/ConfirmationModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { DeviceInfo } from "@/config/deviceInfo";

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
  const [doNotAskAgainChecked, setDoNotAskAgainChecked] = useState(false);
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

  const onAction = async (action: Action) => {
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
        const messaging = getMessaging(firebaseApp);
        const [registration, { deviceId, deviceName }] = await Promise.all([
          navigator.serviceWorker.ready,
          DeviceInfo.generate(),
        ]);
        const fcmToken = await getToken(messaging, {
          vapidKey: Env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        await updateUser({
          devices: [{ deviceId, deviceName, fcmToken }],
        });

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

      <Checkbox
        id="do-not-ask-again"
        isSelected={doNotAskAgainChecked}
        onChange={setDoNotAskAgainChecked}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          {t("notificationsRequest.doNotAskAgain")}
        </Checkbox.Content>
      </Checkbox>
    </ConfirmationModal>
  );
};
