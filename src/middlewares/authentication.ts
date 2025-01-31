import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from "next-firebase-auth-edge";

export const PUBLIC_PATHS = [
  "/register",
  "/login",
  "/unauthorized",
  "/api/logout",
];

export async function authenticationMiddleware(
  request: NextRequest
): Promise<NextResponse | void> {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    // debug: Env.isDev,
    apiKey: Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG.apiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: Env.AUTH_COOKIE_SIGNATURE_KEYS,
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: !Env.isDev, // Set this to true on HTTPS environments
      sameSite: "lax" as const,
      maxAge: 12 * 60 * 60 * 24, // Twelve days
    },
    serviceAccount: {
      projectId: Env.FIREBASE_SERVICE_ACCOUNT.project_id,
      clientEmail: Env.FIREBASE_SERVICE_ACCOUNT.client_email,
      privateKey: Env.FIREBASE_SERVICE_ACCOUNT.private_key,
    },
    handleValidToken: async ({ token, decodedToken, customToken }, headers) => {
      // Authenticated user should not be able to access /login, /register and /reset-password routes
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async (reason) => {
      console.info("Missing or malformed credentials", { reason });

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      });
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error });

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      });
    },
  });
}
