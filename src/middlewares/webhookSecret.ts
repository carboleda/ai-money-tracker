import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_PATHS = new Set(["/api/transaction/webhook"]);

export function webhookSecretMiddleware(
  request: NextRequest,
): NextResponse | void {
  const isWebhookPath = WEBHOOK_PATHS.has(request.nextUrl.pathname);

  if (isWebhookPath) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.error("Unauthorized webhook request");
      return new NextResponse(JSON.stringify({ success: false }), {
        status: 401,
      });
    }

    if (!request.headers.get("X-User-Email")) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Missing X-User-Email header",
        }),
        { status: 400 },
      );
    }

    return NextResponse.next();
  }
}
