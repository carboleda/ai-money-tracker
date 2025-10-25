import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import { FilterTransactionsShareFunctions } from "./functions";
import { SummaryShareFunctions } from "../../summary/functions";

type GetTransactionsParams = { status: TransactionStatus };

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/transaction/[status]">
) {
  const searchParams = req.nextUrl.searchParams;
  const { status } = (await ctx.params) as GetTransactionsParams;
  const account = searchParams.get("acc") ?? undefined;
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const transactions =
    await FilterTransactionsShareFunctions.searchTransactions({
      status,
      account,
      startDate: startDate ? new Date(startDate!) : null,
      endDate: endDate ? new Date(endDate!) : null,
    });

  const summary = await SummaryShareFunctions.computeSummary(
    transactions,
    account
  );

  return NextResponse.json({
    transactions: transactions.filter(
      (transaction) => transaction.status === status
    ),
    summary,
  } as GetTransactionsResponse);
}
