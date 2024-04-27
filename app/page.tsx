"use client";

import React from "react";
import useSWR from "swr";
import { GetTransactionsResponse } from "@/interfaces/transaction";
import { TransactionTable } from "@/components/TransactionTable/TransactionTable";
import { TransactionInput } from "@/components/TransactionInput";

export default function Home() {
  const {
    isLoading,
    data: reesponse,
    error,
  } = useSWR<GetTransactionsResponse, Error>("/api/transactions");

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <TransactionInput />

      <TransactionTable
        transactions={reesponse?.transactions}
        isLoading={isLoading}
      />
    </section>
  );
}
