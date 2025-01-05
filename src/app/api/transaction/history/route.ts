import { SummaryHistoryService } from "./summaryHistoryService";
import { NextResponse } from "next/server";

export async function GET() {
  const transactionsSummaryHistory =
    await SummaryHistoryService.getLastTwelveMonthsHistory();

  return NextResponse.json({ history: transactionsSummaryHistory });
}
