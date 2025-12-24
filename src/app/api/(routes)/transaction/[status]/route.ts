import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { CalculateSummaryMetricsService } from "@/app/api/domain/summary/service/calculate-summary-metrics.service";
import { api } from "@/app/api";
import { withUserContext } from "@/app/api/context/initialize-context";

type GetTransactionsParams = { status: TransactionStatus };

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/transaction/[status]">
) {
  return withUserContext(req, async () => {
    const service = api.resolve(FilterTransactionsService);
    const metricsService = api.resolve(CalculateSummaryMetricsService);

    const searchParams = req.nextUrl.searchParams;
    const { status } = (await ctx.params) as GetTransactionsParams;
    const account = searchParams.get("acc") ?? undefined;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    const transactions = await service.execute({
      status,
      account,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    const summary = await metricsService.execute(transactions, account);

    return NextResponse.json({
      transactions,
      summary,
    });
  });
}
