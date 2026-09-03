"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetTransactionsResponse } from "@/interfaces/transaction";
import { PendingTransactionTable } from "@/components/features/PendingTransaction";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { fetchJson } from "@/config/request";

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { setPageTitle } = useAppStore();
  const url = `/api/transaction/${TransactionStatus.PENDING}`;
  const { isLoading, data: reesponse } = useQuery<GetTransactionsResponse>({
    queryKey: ["/api/transaction", TransactionStatus.PENDING],
    queryFn: () => fetchJson<GetTransactionsResponse>(url),
  });

  useEffect(() => {
    setPageTitle(t("pending"), t("management.subtitle"));
  }, [t, setPageTitle]);

  return (
    <section className="flex flex-col items-center justify-center gap-2">
      <div className="flex flex-col w-full justify-start items-start gap-2 mb-2">
        <SummaryPanel
          summary={reesponse?.summary}
          includedKeys={["totalPending"]}
        />
      </div>

      <PendingTransactionTable
        pendingTransactions={reesponse?.transactions}
        isLoading={isLoading}
      />
    </section>
  );
}
export default PageContent;
