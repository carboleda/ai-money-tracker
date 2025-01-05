import { NextRequest, NextResponse } from "next/server";
import { SummaryShareFunctions } from "./functions";
import { FilterTransactionsShareFunctions } from "../transaction/[status]/functions";
import { Transaction, TransactionStatus } from "@/interfaces/transaction";
import { AccountShareFunctions } from "@/app/api/accounts/functions";
import { SummaryHistoryService } from "@/app/api/transaction/history/summaryHistoryService";
import { GetSummaryResponse } from "@/interfaces/summary";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const [transactions, accountsBalance, transactionsSummaryHistory] =
    await Promise.all([
      FilterTransactionsShareFunctions.searchTransactions({
        status: TransactionStatus.COMPLETE,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }),
      AccountShareFunctions.getAllAccounts(),
      SummaryHistoryService.getLastTwelveMonthsHistory(),
    ]);

  const mappedTransactions = transactions
    .filter((transaction) => transaction.status === TransactionStatus.COMPLETE)
    .map((transaction) => ({
      ...transaction,
      category: transaction.category ?? transaction.description,
    })) as Transaction[];

  const byCategory =
    SummaryShareFunctions.getSummaryByCategory(mappedTransactions);
  const byType = SummaryShareFunctions.getSummaryByType(mappedTransactions);
  const recurrentVsVariable =
    SummaryShareFunctions.getRecurrentVsVariableComparison(mappedTransactions);

  const totalBalance = SummaryShareFunctions.computeBalance(accountsBalance);

  return NextResponse.json({
    summary: {
      accountsBalance,
      transactionsSummaryHistory,
      byCategory,
      byType,
      recurrentVsVariable,
      totalBalance,
    },
    transactions: mappedTransactions,
  } as GetSummaryResponse);
}
