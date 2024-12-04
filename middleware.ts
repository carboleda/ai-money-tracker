import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from "next-firebase-auth-edge";

const PUBLIC_PATHS = ["/register", "/login"];

function getRatelimit(method: string) {
  if (method === "POST") {
    return new Ratelimit({
      redis: kv,
      // 1 requests from the same IP in 10 seconds
      limiter: Ratelimit.slidingWindow(1, "10 s"),
    });
  }

  return new Ratelimit({
    redis: kv,
    // 5 requests from the same IP in 10 seconds
    limiter: Ratelimit.slidingWindow(5, "10 s"),
  });
}

// Define which routes you want to rate limit
export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
    "/api/transaction",
  ],
};

export default async function middleware(request: NextRequest) {
  if (Env.RATE_LIMIT_ENABLED) {
    // You could alternatively limit based on user ID or similar
    const ip = request.ip ?? "127.0.0.1";
    const rl = getRatelimit(request.method);
    const { success, limit, reset, remaining } = await rl.limit(ip);
    console.log("Ratelimit", { ip, success, limit, reset, remaining });

    if (!success) {
      return new NextResponse(null, { status: 429 });
    }
  }

  // if (Env.isDev) {
  //   return NextResponse.next();
  // }

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
