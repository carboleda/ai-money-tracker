import { initializeApp, cert, getApps } from "firebase-admin/app";
import * as env from "@/config/env";

const alreadyCreatedAps = getApps();
if (alreadyCreatedAps.length === 0) {
  initializeApp({
    credential: cert(env.FIREBASE_SERVICE_ACCOUNT),
  });
}

export const { db, Collections } = await import("./firestore");
