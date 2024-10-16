"use client";

import React from "react";
import useSWR from "swr";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import { PendingTransactionTable } from "@/components/PendingTransaction";

export default function PendingTransactions() {
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.PENDING}`
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-row w-full justify-start gap-2">
        <h1 className="text-3xl font-bold">Pending Transactions</h1>
      </div>
      <PendingTransactionTable
        transactions={reesponse?.transactions}
        accounts={reesponse?.accounts}
        isLoading={isLoading}
      />
    </section>
  );
}
