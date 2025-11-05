import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { PendingTransactionNotificationService } from "@/app/api/domain/notification/service/pending-transaction-notification.service";
import { CreateMonthlySummaryService } from "@/app/api/domain/summary/service/create-monthly-summary.service";
import { api } from "@/app/api";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const CRON_SECRET = process.env.CRON_SECRET;
  const isLocal = process.env.NODE_ENV === "development";

  if (!isLocal && (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`)) {
    console.error("Unauthorized request");
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 401,
    });
  }

  const notificationService = api.resolve(
    PendingTransactionNotificationService
  );
  const summaryHistoryService = api.resolve(CreateMonthlySummaryService);

  const results = await Promise.allSettled([
    notificationService.execute(),
    summaryHistoryService.execute(),
  ]);

  return NextResponse.json({
    notifications: results[0].status,
    summary: results[1].status,
  });
}
