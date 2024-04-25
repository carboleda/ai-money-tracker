import React from "react";
import { TransactionTable } from "@/components/transaction-table";
import { CreateTransactionInput } from "@/components/create-transaction-input";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <CreateTransactionInput />

      <TransactionTable />
    </section>
  );
}
