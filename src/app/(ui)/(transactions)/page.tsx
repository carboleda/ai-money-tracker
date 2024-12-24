"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  GetTransactionsResponse,
  Summary,
  TransactionStatus,
} from "@/interfaces/transaction";
import {
  CreateTransactionModalForm,
  TransactionTable,
} from "@/components/Transactions";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { getMonthBounds } from "@/config/utils";
import { SummaryPanel } from "@/components/SummaryPanel";
import { withAuth } from "@/app/(ui)/withAuth";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { Button } from "@nextui-org/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CustomDateRangePicker } from "@/components/shared/CustomDateRangePicker";
import { useTranslations } from "next-intl";

function Transactions() {
  const t = useTranslations();
  const isMobile = useIsMobile();
  const [isOpen, setOpen] = useState(false);
  const currentMonthBounds = getMonthBounds(new Date());
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
    start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
    end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
  });
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.COMPLETE}/?acc=${selectedAccount}&start=${dateWithinStart}&end=${dateWithinEnd}`
  );

  const onDialogDismissed = () => {
    setOpen(false);
  };

  const renderTopContent = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap justify-between gap-3 items-end">
        <div className="flex flex-row justify-items-stretch gap-2 w-full md:w-fit">
          <CustomDateRangePicker
            label={t("dateRangeFilter")}
            variant="bordered"
            granularity="day"
            isRequired
            value={dateWithin}
            onChange={setDateWithin}
          />
          <div className="justify-self-end">
            <BankAccounDropdown
              label={t("accountFilter")}
              onChange={setSelectedAccount}
            />
          </div>
        </div>
        {/* <div className="flex justify-end w-full md:w-fit">
          <Button
            color="primary"
            radius="sm"
            variant="flat"
            onPress={() => setOpen(true)}
          >
            <HiOutlinePlusCircle className="text-xl" />
            New trans.
          </Button>
        </div> */}
      </div>
    </div>
  );

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col w-full justify-start items-start gap-2">
          <div className="flex justify-between items-center w-full">
            <h1 className="page-title">{t("Transactions.subtitle")}</h1>
            <Button
              color="primary"
              radius="sm"
              variant="solid"
              isIconOnly
              onPress={() => setOpen(true)}
            >
              <HiOutlinePlusCircle className="text-xl" />
            </Button>
          </div>
          <SummaryPanel
            summary={reesponse?.summary}
            includedKeys={[
              "totalBalance",
              ...(!isMobile ? ["totalIncomes" as keyof Summary] : []),
              "totalExpenses",
              "totalPending",
            ]}
          />
        </div>
        {renderTopContent()}
        <TransactionTable
          transactions={reesponse?.transactions}
          isLoading={isLoading}
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
