import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { PUBLIC_PATHS } from "./authentication";

export async function authorizatonMiddleware(
  request: NextRequest
): Promise<NextResponse | void> {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return;
  }

  if (Env.isLocal) {
    return NextResponse.next();
  }

  const tokens = await getTokens(request.cookies, {
    apiKey: Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG.apiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: Env.AUTH_COOKIE_SIGNATURE_KEYS,
    serviceAccount: {
      projectId: Env.FIREBASE_SERVICE_ACCOUNT.project_id,
      clientEmail: Env.FIREBASE_SERVICE_ACCOUNT.client_email,
      privateKey: Env.FIREBASE_SERVICE_ACCOUNT.private_key,
    },
  });

  const { email, name, picture } = tokens?.decodedToken || {};
  request.headers.set("X-User-Email", email || "");
  request.headers.set("X-User-Name", encodeURIComponent(name || ""));
  request.headers.set("X-User-Picture", picture || "");
}
