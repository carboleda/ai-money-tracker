import { Env } from "@/config/env";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const alreadyCreatedAps = getApps();
if (alreadyCreatedAps.length === 0) {
  initializeApp({
    credential: cert(Env.FIREBASE_SERVICE_ACCOUNT),
  });
  getFirestore().settings({ ignoreUndefinedProperties: true });
}

export const { db, Collections } = await import("./firestore");
export const { sendMessage } = await import("./messaging");
