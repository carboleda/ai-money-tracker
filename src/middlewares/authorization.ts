import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { getTokens, redirectToPath } from "next-firebase-auth-edge";
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
    apiKey: Env.FIREBASE_SERVICE_ACCOUNT.apiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: Env.AUTH_COOKIE_SIGNATURE_KEYS,
    serviceAccount: Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG as any,
  });

  if (
    tokens?.decodedToken?.email &&
    tokens?.decodedToken?.email !== "arbofercho@gmail.com" // TODO: Improved this
  ) {
    console.log("Unauthorized access", tokens?.decodedToken?.email);
    const response = redirectToPath(request, "/unauthorized");
    response.cookies.delete("AuthToken");

    return response;
  }
}
