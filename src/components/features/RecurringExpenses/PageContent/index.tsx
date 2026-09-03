"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RecurringExpensesTable } from "@/components/features/RecurringExpenses";
import type { GetRecurringExpensesOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatCurrency } from "@/config/utils";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { HiFire, HiOutlineCalendar } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { fetchJson } from "@/config/request";

const KEY = "/api/recurring-expenses";

function PageContent() {
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { setPageTitle } = useAppStore();

  useEffect(() => {
    setPageTitle(t("recurring"), t("subtitle"));
  }, [t, setPageTitle]);

  const { isLoading, data: reesponse } = useQuery<GetRecurringExpensesOutput>({
    queryKey: [KEY],
    queryFn: () => fetchJson<GetRecurringExpensesOutput>(KEY),
  });

  return (
    <section className="flex flex-col items-center justify-center gap-2">
      <div className="flex flex-col w-full justify-start items-start gap-2 mb-2">
        <div className="flex flex-wrap gap-2">
          <TransactionTypeDecorator
            color="accent"
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
            color="default"
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

export default PageContent;
