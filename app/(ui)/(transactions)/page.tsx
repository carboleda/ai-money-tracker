"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import {
  CreateTransactionModalForm,
  TransactionTable,
} from "@/components/Transactions";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { DateRangePicker } from "@nextui-org/date-picker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { getMonthBounds } from "@/config/utils";
import { SummaryPanel } from "@/components/SummaryPanel";
import { withAuth } from "@/app/(ui)/withAuth";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { Button } from "@nextui-org/button";

function Transactions() {
  const [isOpen, setOpen] = useState(false);
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

  const onDialogDismissed = () => {
    setOpen(false);
  };

  const renderTopContent = () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
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
        <div className="flex w-full justify-end">
          <Button color="primary" onPress={() => setOpen(true)}>
            <HiOutlinePlusCircle className="text-lg" />
            New trans.
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col w-full justify-start items-start gap-2">
          <h1 className="page-title">All your transactions</h1>
          <SummaryPanel summary={reesponse?.summary} />
        </div>

        <TransactionTable
          transactions={reesponse?.transactions}
          isLoading={isLoading}
          topContent={renderTopContent()}
        />
      </section>
      <CreateTransactionModalForm
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
}

export default withAuth(Transactions);
