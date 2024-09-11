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
      <PendingTransactionTable
        transactions={reesponse?.transactions}
        accounts={reesponse?.accounts}
        isLoading={isLoading}
      />
    </section>
  );
}
