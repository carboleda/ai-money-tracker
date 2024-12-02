import { Env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import { FilterTransactionsShareFunctions } from "./functions";
import { SummaryShareFunctions } from "../../summary/functions";

type GetTransactionsParams = { params: { status: TransactionStatus } };

export async function GET(req: NextRequest, { params }: GetTransactionsParams) {
  const searchParams = req.nextUrl.searchParams;
  const status = params.status;
  const account = searchParams.get("acc");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const transactions =
    await FilterTransactionsShareFunctions.searchTransactions({
      status,
      account,
      startDate: startDate ? new Date(startDate!) : null,
      endDate: endDate ? new Date(endDate!) : null,
    });

  const summary = SummaryShareFunctions.computeSummary(transactions);

  return NextResponse.json({
    accounts: Env.VALID_ACCOUNTS,
    transactions: transactions.filter(
      (transaction) => transaction.status === params.status
    ),
    summary,
  } as GetTransactionsResponse);
}
