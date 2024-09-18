import { initializeApp, cert, getApps } from "firebase-admin/app";
import { Env } from "@/config/env";

const alreadyCreatedAps = getApps();
if (alreadyCreatedAps.length === 0) {
  initializeApp({
    credential: cert(Env.FIREBASE_SERVICE_ACCOUNT),
  });
}

export const { db, Collections } = await import("./firestore");
export const { sendMessage } = await import("./messaging");
