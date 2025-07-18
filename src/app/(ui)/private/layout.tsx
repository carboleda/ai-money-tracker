import "@/styles/globals.css";
import FcmProvider from "@/components/providers/FcmProvider";
import { Sidebar } from "@/components/shared/Sidebar";
import { firebaseApp } from "@/firebase/client";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { Env } from "@/config/env";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!cookies()) {
    return <span>No cookies found</span>;
  }

  const tokens = await getTokens(cookies(), {
    apiKey: Env.FIREBASE_SERVICE_ACCOUNT.apiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: Env.AUTH_COOKIE_SIGNATURE_KEYS,
    serviceAccount: Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG as any,
  });

  const user = tokens?.decodedToken;

  return (
    <section>
      <FcmProvider firebaseApp={firebaseApp}>
        <Sidebar user={user}>{children}</Sidebar>
      </FcmProvider>
    </section>
  );
}
