"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { GetSummaryResponse } from "@/interfaces/summary";
import { getMonthBounds } from "@/config/utils";
import { CustomDateRangePicker } from "@/components/shared/CustomDateRangePicker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { CategoriesChart } from "@/components/charts/CategoriesChart";
import { FixedVsVariableChart } from "@/components/charts/FixedVsVariableChart";
import { Tiles } from "@/components/Summary/Tiles";
import { AccountsBalanceTitle } from "@/components/Summary/AccountsBalanceTitle";
import { TransactionsByTypeTitle } from "@/components/Summary/TransactionsByTypeTitle";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionsSummaryHistoryChart } from "@/components/charts/TransactionsSummaryHistoryChart";

const currentMonthBounds = getMonthBounds(new Date());

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
    start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
    end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
  });
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();
  const { data: response } = useSWR<GetSummaryResponse, Error>(
    `/api/summary?start=${dateWithinStart}&end=${dateWithinEnd}`
  );

  const tiles = [
    {
      title: t("accountBalance"),
      data: (
        <AccountsBalanceTitle
          accountsBalance={response?.summary?.accountsBalance}
          totalBalance={response?.summary?.totalBalance}
        />
      ),
    },
    {
      title: t("transactionsByType"),
      data: <TransactionsByTypeTitle byType={response?.summary?.byType} />,
    },
    {
      title: t("transactionsSummaryHistory"),
      className: "md:col-span-2",
      data: response?.summary.transactionsSummaryHistory && (
        <TransactionsSummaryHistoryChart
          data={response?.summary.transactionsSummaryHistory}
        />
      ),
    },
    {
      title: t("transactionsByCategory"),
      data: response?.summary?.byCategory && (
        <CategoriesChart
          data={response?.summary?.byCategory}
          detail={response?.transactions}
        />
      ),
    },
    {
      title: t("reccurentVsVariable"),
      data: response?.summary?.recurrentVsVariable && (
        <FixedVsVariableChart data={response?.summary?.recurrentVsVariable} />
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col w-full justify-start items-start gap-2">
        <h1 className="page-title">{t("subtitle")}</h1>
      </div>
      <div className="flex flex-row justify-items-stretch gap-2 w-full md:w-fit">
        <CustomDateRangePicker
          label={t("dateRangeFilter")}
          variant="bordered"
          granularity="day"
          isRequired
          value={dateWithin}
          onChange={setDateWithin}
        />
      </div>

      <Tiles tiles={tiles} />
    </section>
  );
}

export default PageContent;
