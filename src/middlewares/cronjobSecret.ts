import { NextRequest, NextResponse } from "next/server";
import vercelJson from "../../vercel.json" assert { type: "json" };

export async function cronjobSecretMiddleware(
  request: NextRequest
): Promise<NextResponse | void> {
  const isCronPath = vercelJson.crons.some(
    (cron) => cron.path === request.nextUrl.pathname
  );
  if (isCronPath) {
    const CRON_SECRET = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      console.error("Unauthorized request");
      return new NextResponse(JSON.stringify({ success: false }), {
        status: 401,
      });
    }

    return NextResponse.next();
  }
}
