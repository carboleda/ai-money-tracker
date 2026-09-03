"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetTransactionsResponse, Summary } from "@/interfaces/transaction";
import { fetchJson } from "@/config/request";
import { TransactionTable } from "@/components/features/Transactions";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { getMonthBounds } from "@/config/utils";
import {
  ZolventFilter,
  ZolventFilters,
} from "@/components/shared/ZolventFilter/ZolventFilter";

const currentMonthBounds = getMonthBounds(new Date());
const defaultFilterValues: ZolventFilters = {
  startDate: currentMonthBounds.start.toISOString(),
  endDate: currentMonthBounds.end.toISOString(),
};

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { setPageTitle } = useAppStore();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<ZolventFilters>({});
  const {
    freeText: filterValue = "",
    account: selectedAccount = "",
    startDate: dateWithinStart = "",
    endDate: dateWithinEnd = "",
  } = filters;
  const url = `/api/transaction/${TransactionStatus.COMPLETE}/?acc=${selectedAccount}&start=${dateWithinStart}&end=${dateWithinEnd}`;
  const { isLoading, data: reesponse } = useQuery<GetTransactionsResponse>({
    queryKey: [
      "/api/transaction",
      TransactionStatus.COMPLETE,
      { acc: selectedAccount, start: dateWithinStart, end: dateWithinEnd },
    ],
    queryFn: () => fetchJson<GetTransactionsResponse>(url),
  });

  useEffect(() => {
    setPageTitle(t("transactions"), t("subtitle"));
  }, [t, setPageTitle]);

  const transactions = useMemo(() => {
    if (!reesponse?.transactions) return reesponse?.transactions;

    let filteredTransations = [...(reesponse?.transactions ?? [])];

    if (filterValue) {
      filteredTransations = filteredTransations.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(filterValue?.toLowerCase()) ||
          transaction.category?.name
            ?.toLowerCase()
            .includes(filterValue?.toLowerCase()),
      );
    }

    return filteredTransations;
  }, [reesponse?.transactions, filterValue]);

  return (
    <ZolventFilter
      t={t}
      storageKey="transactions-filters"
      defaultFilterValues={defaultFilterValues}
      onFilter={setFilters}
    >
      <section className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-col w-full justify-start items-start gap-2 mb-2">
          <SummaryPanel
            summary={reesponse?.summary}
            shortNumber={isMobile}
            includedKeys={[
              "totalBalance",
              ...(isMobile ? [] : ["totalIncomes" as keyof Summary]),
              "totalExpenses",
              "totalTransfers",
            ]}
          />
        </div>
        <TransactionTable transactions={transactions} isLoading={isLoading} />
      </section>
    </ZolventFilter>
  );
}

export default PageContent;
