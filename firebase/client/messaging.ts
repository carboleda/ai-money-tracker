"use client";

import { FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  MessagePayload,
  onMessage,
} from "firebase/messaging";

export const initializeFirebaseMessaging = async (firebaseApp: FirebaseApp) => {
  try {
    const messaging = getMessaging(firebaseApp);

    console.log("Requesting permission...");
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      const currentToken = await getToken(messaging, {
        vapidKey:
          "BBJ4pIdE85ik9AB2Lei3WtgJosb2DzGXssJiVjx3BUP35d56-8eTMRQ1aMbjHEZzozKfus49njKkcSQ2w8gepb0",
      });
      alert(currentToken);
    } else {
      throw new Error("Permission denied.");
    }

    console.log("Setting up onMessage handler...");
    onMessage(messaging, (payload: MessagePayload) => {
      console.log("[UI] Message received. ", payload);
      const { title = "New message", body } = payload.notification ?? {};
      console.log("Creating new notification");
      new Notification(title, {
        body,
      });
    });
  } catch (err) {
    console.error("Error getting notification permission or token", err);
  }
};
