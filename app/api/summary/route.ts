import { NextResponse } from "next/server";
import { SummaryShareFunctions } from "./functions";
import { FilterTransactionsShareFunctions } from "../transaction/[status]/functions";
import { TransactionStatus } from "@/interfaces/transaction";
import { AccountShareFunctions } from "../accounts/functions";

export async function GET(req: Request) {
  const transactions =
    await FilterTransactionsShareFunctions.searchTransactions({
      status: TransactionStatus.COMPLETE,
    });

  const mappedTransactions = transactions
    .filter((transaction) => transaction.status === TransactionStatus.COMPLETE)
    .map((transaction) => ({
      ...transaction,
      category: transaction.category ?? transaction.description,
    }));

  const byCategory =
    SummaryShareFunctions.getSummaryByCategory(mappedTransactions);
  const byType = SummaryShareFunctions.getSummaryByType(mappedTransactions);
  const byAccount =
    SummaryShareFunctions.getSummaryByAccount(mappedTransactions);

  const accountsBalance = await AccountShareFunctions.getAllAccounts();

  return NextResponse.json({
    accountsBalance,
    byCategory,
    byType,
    byAccount,
  });
}
