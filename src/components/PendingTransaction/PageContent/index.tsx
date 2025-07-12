"use client";

import React from "react";
import useSWR from "swr";
import {
  GetTransactionsResponse,
  TransactionStatus,
} from "@/interfaces/transaction";
import { PendingTransactionTable } from "@/components/PendingTransaction";
import { SummaryPanel } from "@/components/SummaryPanel";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.RecurrentExpenses);
  const { isLoading, data: reesponse } = useSWR<GetTransactionsResponse, Error>(
    `/api/transaction/${TransactionStatus.PENDING}`
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">{t("management.subtitle")}</h1>
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
