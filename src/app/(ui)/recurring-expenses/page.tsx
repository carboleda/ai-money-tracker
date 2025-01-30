"use client";

import React from "react";
import useSWR from "swr";
import { RecurringExpensesTable } from "@/components/RecurringExpenses";
import { GetRecurringExpensesResponse } from "@/interfaces/recurringExpense";
import { withAuth } from "@/app/(ui)/withAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatCurrency } from "@/config/utils";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { HiFire } from "react-icons/hi";
import { HiOutlineCalendar } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

function RecurringExpenses() {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.RecurrentExpenses);

  const { isLoading, data: reesponse } = useSWR<
    GetRecurringExpensesResponse,
    Error
  >("/api/recurring-expenses");

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">{t("subtitle")}</h1>
        <div className="flex flex-wrap gap-2">
          <TransactionTypeDecorator
            color="primary"
            size={isMobile ? "sm" : "md"}
            avatar={<HiFire />}
          >
            {reesponse?.groupTotal && (
              <>
                <span className="font-bold hidden md:inline">
                  {t("monthly")}&nbsp;
                </span>
                {formatCurrency(reesponse?.groupTotal.monthly)}
              </>
            )}
          </TransactionTypeDecorator>

          <TransactionTypeDecorator
            color="secondary"
            size={isMobile ? "sm" : "md"}
            avatar={<HiOutlineCalendar />}
          >
            {reesponse?.groupTotal && (
              <>
                <span className="font-bold hidden md:inline">
                  {t("biannualAndYearly")}&nbsp;
                </span>
                {formatCurrency(reesponse?.groupTotal.others)}
              </>
            )}
          </TransactionTypeDecorator>
        </div>
      </div>
      <RecurringExpensesTable
        recurringExpenses={reesponse?.recurringExpensesConfig}
        isLoading={isLoading}
      />
    </section>
  );
}

export default withAuth(RecurringExpenses);
