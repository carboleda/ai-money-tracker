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
import { DateRangePicker } from "@nextui-org/date-picker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { getMonthBounds } from "@/config/utils";

export default function Transactions() {
  const currentMonthBounds = getMonthBounds(new Date());
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [dateWithin, setDateWithin] = React.useState<RangeValue<ZonedDateTime>>(
    {
      start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
      end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
    }
  );
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.COMPLETE}/?acc=${selectedAccount}&start=${dateWithinStart}&end=${dateWithinEnd}`
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-row w-full justify-start gap-2">
        <h1 className="page-title">All your transactions</h1>
      </div>
      <TransactionInput />

      <div className="flex flex-row self-start gap-2">
        <DateRangePicker
          label="Date within"
          variant="bordered"
          granularity="day"
          isRequired
          value={dateWithin}
          onChange={setDateWithin}
        />
        <BankAccounDropdown
          accounts={reesponse?.accounts}
          label="Filter by account"
          onChange={setSelectedAccount}
        />
      </div>

      <TransactionTable
        transactions={reesponse?.transactions}
        isLoading={isLoading}
      />
    </section>
  );
}
