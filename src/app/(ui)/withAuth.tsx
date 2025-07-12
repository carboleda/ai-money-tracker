import FcmProvider from "@/components/providers/FcmProvider";
import { Sidebar } from "@/components/shared/Sidebar";
import { firebaseApp } from "@/firebase/client";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { Env } from "@/config/env";

type ComponentProps = any;

export async function withAuth(Component: React.FC) {
  if (!cookies()) {
    return null;
  }

  const tokens = await getTokens(cookies(), {
    apiKey: Env.FIREBASE_SERVICE_ACCOUNT.apiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: Env.AUTH_COOKIE_SIGNATURE_KEYS,
    serviceAccount: Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG as any,
  });

  if (!tokens?.decodedToken) {
    return null;
  }

  const user = tokens?.decodedToken;

  return function withAuth(props: ComponentProps) {
    return (
      <FcmProvider firebaseApp={firebaseApp}>
        <Sidebar user={user}>
          <Component {...props} />
        </Sidebar>
      </FcmProvider>
    );
  };
}
