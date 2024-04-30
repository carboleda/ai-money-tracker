"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { GetTransactionsResponse } from "@/interfaces/transaction";
import { TransactionTable } from "@/components/TransactionTable/TransactionTable";
import { TransactionInput } from "@/components/TransactionInput";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";

export default function Home() {
  const [selectedAccount, setAelectedAccount] = useState<string>("");
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction?acc=${selectedAccount}`
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <TransactionInput />

      <div className="self-start">
        <BankAccounDropdown
          accounts={reesponse?.accounts}
          onChange={setAelectedAccount}
        />
      </div>

      <TransactionTable
        transactions={reesponse?.transactions}
        isLoading={isLoading}
      />
    </section>
  );
}
