"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import { TransactionTable } from "@/components/TransactionTable/TransactionTable";
import { TransactionInput } from "@/components/TransactionInput";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";

export default function Transactions() {
  const [selectedAccount, setAelectedAccount] = useState<string>("");
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.COMPLETE}/?acc=${selectedAccount}`
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4">
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
