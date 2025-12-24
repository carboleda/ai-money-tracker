"use client";

import { useEffect, useMemo, useState } from "react";
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
import { HiOutlinePlusCircle } from "react-icons/hi";
import { Button } from "@heroui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CustomDateRangePicker } from "@/components/shared/CustomDateRangePicker";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { SearchToolbar } from "@/components/Transactions/SearchToolbar";
import { useAppStore } from "@/stores/useAppStore";

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { setPageTitle } = useAppStore();
  const isMobile = useIsMobile();
  const [isOpen, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
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

  useEffect(() => {
    setPageTitle(t("transactions"), t("subtitle"));
  }, [t, setPageTitle]);

  const onDialogDismissed = () => {
    setOpen(false);
  };

  const transactions = useMemo(() => {
    if (!reesponse?.transactions) return reesponse?.transactions;

    let filteredTransations = [...reesponse?.transactions];

    if (filterValue) {
      filteredTransations = filteredTransations.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          transaction.category
            ?.toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }

    return filteredTransations;
  }, [reesponse?.transactions, filterValue]);

  const renderTopContent = () => {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex justify-between gap-2 items-center">
          <SearchToolbar
            filterValue={filterValue}
            onSearchChange={setFilterValue}
          >
            <div className="flex flex-row gap-2">
              <CustomDateRangePicker
                label={t("dateRangeFilter")}
                variant="bordered"
                granularity="day"
                isRequired
                value={dateWithin}
                onChange={setDateWithin}
              />
              <BankAccounDropdown
                label={t("accountFilter")}
                onChange={setSelectedAccount}
              />
              <Button
                color="success"
                radius="sm"
                variant="solid"
                isIconOnly
                onPress={() => setOpen(true)}
              >
                <HiOutlinePlusCircle className="text-xl" />
              </Button>
            </div>
          </SearchToolbar>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col w-full justify-start items-start gap-2">
          <SummaryPanel
            summary={reesponse?.summary}
            shortNumber={isMobile}
            includedKeys={[
              "totalBalance",
              ...(!isMobile ? ["totalIncomes" as keyof Summary] : []),
              "totalExpenses",
              "totalTransfers",
            ]}
          />
        </div>
        {renderTopContent()}
        <TransactionTable transactions={transactions} isLoading={isLoading} />
      </section>
      <CreateTransactionModalForm
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
}

export default PageContent;
