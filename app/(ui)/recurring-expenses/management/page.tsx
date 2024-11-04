"use client";

import React from "react";
import useSWR from "swr";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import { PendingTransactionTable } from "@/components/PendingTransaction";
import { SummaryPanel } from "@/components/SummaryPanel";
import { withAuth } from "@/app/withAuth";

function PendingTransactions() {
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.PENDING}`
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">What you have to pay this month</h1>
        <SummaryPanel summary={reesponse?.summary} />
      </div>

      <PendingTransactionTable
        pendingTransactions={reesponse?.transactions}
        accounts={reesponse?.accounts}
        isLoading={isLoading}
      />
    </section>
  );
}
export default withAuth(PendingTransactions);
