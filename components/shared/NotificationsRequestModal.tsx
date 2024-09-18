import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { useEffect } from "react";
import { Env } from "@/config/env";
import { getMessaging, getToken } from "firebase/messaging";
import { FirebaseApp } from "firebase/app";
import { useMutateUser } from "@/hooks/useMutateUser";

interface NotificationRequestModalProps {
  firebaseApp?: FirebaseApp;
  onPermissionGranted: () => void;
}

export const NotificationRequestModal: React.FC<
  NotificationRequestModalProps
> = ({ firebaseApp, onPermissionGranted }) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { updateUser } = useMutateUser();
  const permission = Env.isServer ? "granted" : Notification.permission;

  useEffect(() => {
    if (permission !== "granted") {
      onOpen();
    }
  }, [permission, onOpen]);

  const onAccept = async () => {
    try {
      onClose();

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const messaging = getMessaging(firebaseApp);
        const fcmToken = await getToken(messaging, {
          vapidKey: Env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        await updateUser({ fcmToken });

        onPermissionGranted();
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  return (
    <>
      <Modal id="m1" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Money Track wants to keep you informed! 🔔
              </ModalHeader>
              <ModalBody>
                <p>
                  To provide you with real-time alerts and reminders about your
                  spending, income, and financial goals, we need your permission
                  to send push notifications. This will help you:
                </p>
                <ul>
                  <li>◦ Receive reminders of overdue payments.</li>
                  <li>◦ Receive timely reminders for bills and payments.</li>
                  <li>
                    ◦ Never miss a payment or an opportunity to save again!.
                  </li>
                </ul>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  No
                </Button>
                <Button color="primary" onPress={onAccept}>
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
