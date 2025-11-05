import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { FilterTransactionsService } from "@/app/api/domain/transaction/service/filter-transactions.service";
import { api } from "@/app/api";

type GetTransactionsParams = { status: TransactionStatus };

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/transaction/[status]">
) {
  const service = api.resolve(FilterTransactionsService);

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

  return NextResponse.json({
    transactions,
  });
}
