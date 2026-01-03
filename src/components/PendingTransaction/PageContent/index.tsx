"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { GetTransactionsResponse } from "@/interfaces/transaction";
import { PendingTransactionTable } from "@/components/PendingTransaction";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.RecurrentExpenses);
  const { setPageTitle } = useAppStore();
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.PENDING}`
  );

  useEffect(() => {
    setPageTitle(t("pending"), t("management.subtitle"));
  }, [t, setPageTitle]);

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
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
