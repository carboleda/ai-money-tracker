import "reflect-metadata";
import { NextResponse } from "next/server";
import { PendingTransactionNotificationService } from "@/app/api/domain/notification/service/pending-transaction-notification.service";
import { CreateMonthlySummaryService } from "@/app/api/domain/summary/service/create-monthly-summary.service";
import { api } from "@/app/api";

export async function GET() {
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
