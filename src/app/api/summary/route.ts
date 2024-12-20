import { NextRequest, NextResponse } from "next/server";
import { SummaryShareFunctions } from "./functions";
import { FilterTransactionsShareFunctions } from "../transaction/[status]/functions";
import { Transaction, TransactionStatus } from "@/interfaces/transaction";
import { AccountShareFunctions } from "../accounts/functions";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const transactions =
    await FilterTransactionsShareFunctions.searchTransactions({
      status: TransactionStatus.COMPLETE,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

  const mappedTransactions = transactions
    .filter((transaction) => transaction.status === TransactionStatus.COMPLETE)
    .map((transaction) => ({
      ...transaction,
      category: transaction.category ?? transaction.description,
    })) as Transaction[];

  const byCategory =
    SummaryShareFunctions.getSummaryByCategory(mappedTransactions);
  const byType = SummaryShareFunctions.getSummaryByType(mappedTransactions);

  const accountsBalance = await AccountShareFunctions.getAllAccounts();
  const totalBalance = SummaryShareFunctions.computeBalance(accountsBalance);

  return NextResponse.json({
    summary: {
      accountsBalance,
      byCategory,
      byType,
      totalBalance,
    },
    transactions: mappedTransactions,
  });
}