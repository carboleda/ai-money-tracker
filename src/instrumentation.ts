import { Env } from "./config/env";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/genai/genkitAI");

    // Initialize Firebase App
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    const alreadyCreatedAps = getApps();
    if (alreadyCreatedAps.length === 0) {
      initializeApp({
        credential: cert(Env.FIREBASE_SERVICE_ACCOUNT),
      });
      console.log("Firebase app initialized successfully.");
    }

    // try {
    //   const data = await genkitAI.extractData("Pago de prueba por 2000, AFC");
    //   console.log("Extracted data:", data);
    // } catch (e) {
    //   console.error("Error extracting data:", e);
    // }
    console.log("Genkit AI module loaded successfully.");
  }
}
