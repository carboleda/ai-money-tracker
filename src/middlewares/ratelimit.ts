import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

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

function getClientIp(request: NextRequest): string {
  let clientIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(0)
    ?.trim(); // When behind a proxy/load balancer

  if (!clientIp) {
    // Alternative header
    clientIp = request.headers.get("x-real-ip") || undefined;
  }

  return clientIp || "127.0.0.1";
}

export async function ratelimitMiddleware(
  request: NextRequest
): Promise<NextResponse | void> {
  if (Env.RATE_LIMIT_ENABLED) {
    // You could alternatively limit based on user ID or similar
    const ip = getClientIp(request);
    const rl = getRatelimit(request.method);
    const { success, limit, reset, remaining } = await rl.limit(ip);
    console.log("Ratelimit", { ip, success, limit, reset, remaining });

    if (!success) {
      return new NextResponse(null, { status: 429 });
    }
  }
}
