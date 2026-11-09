"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetSummaryResponse } from "@/interfaces/summary";
import { fetchJson } from "@/config/request";
import { getMonthBounds } from "@/config/utils";
import {
  CustomDateRangePicker,
  RangeList,
} from "@/components/shared/CustomDateRangePicker/ButtonGroup";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import { CashflowAreaChart } from "@/components/charts/recharts/CashflowAreaChart";
import { CategoryDonutChart } from "@/components/charts/recharts/CategoryDonutChart";
import { FixedVsVariableBarChart } from "@/components/charts/recharts/FixedVsVariableBarChart";
import { SummaryMetricsStrip } from "@/components/features/Summary/SummaryMetricsStrip";
import { ConnectedAccountsTile } from "@/components/features/Summary/ConnectedAccountsTile";
import { RecentTransactionsTile } from "@/components/features/Summary/RecentTransactionsTile";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";

const currentMonthBounds = getMonthBounds(new Date());

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const { setPageTitle } = useAppStore();
  const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
    start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
    end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
  });
  const [selectedKey, setSelectedKey] = useState<RangeList>(
    RangeList.currentMonth,
  );
  const dateWithinStart = dateWithin.start.toDate().toISOString();
  const dateWithinEnd = dateWithin.end.toDate().toISOString();
  const url = `/api/summary?start=${dateWithinStart}&end=${dateWithinEnd}`;
  const { data: response } = useQuery<GetSummaryResponse>({
    queryKey: ["/api/summary", { start: dateWithinStart, end: dateWithinEnd }],
    queryFn: () => fetchJson<GetSummaryResponse>(url),
  });

  useEffect(() => {
    setPageTitle(t("summary"), t("subtitle"));
  }, [t, setPageTitle]);

  const summary = response?.summary;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-row justify-items-stretch gap-2 w-full md:w-fit">
        <CustomDateRangePicker
          label={t("dateRangeFilter")}
          granularity="day"
          isRequired
          showLabel
          value={dateWithin}
          onChange={setDateWithin}
          selectedKey={selectedKey}
          onSelectedKeyChange={setSelectedKey}
        />
      </div>

      <SummaryMetricsStrip
        totalBalance={summary?.totalBalance}
        trends={summary?.trends}
        byType={summary?.byType}
        cashflow={summary?.cashflow}
      />

      <FixedVsVariableBarChart data={summary?.recurringVsVariable} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CashflowAreaChart data={summary?.cashflow} />
        </div>
        <div className="lg:col-span-5">
          <ConnectedAccountsTile
            accountsBalance={summary?.accountsBalance}
            totalBalance={summary?.totalBalance}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <CategoryDonutChart
            data={summary?.byCategory}
            detail={response?.transactions}
            trendPercentage={summary?.trends?.expenses.percentageChange}
          />
        </div>
        <div className="lg:col-span-7">
          <RecentTransactionsTile transactions={summary?.recentTransactions} />
        </div>
      </div>
    </section>
  );
}

export default PageContent;
