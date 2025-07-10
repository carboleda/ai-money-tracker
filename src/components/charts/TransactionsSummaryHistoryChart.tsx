"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import { TransactionsSummaryHistory } from "@/interfaces/account";
import { useTransactionsSummaryHistoryChart } from "@/hooks/charts/useTransactionsSummaryHistoryChart";
import { Switch } from "@heroui/switch";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export interface TransactionsSummaryHistoryChartProps {
  data?: TransactionsSummaryHistory[];
}

export const TransactionsSummaryHistoryChart: React.FC<
  TransactionsSummaryHistoryChartProps
> = ({ data }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const { options, showLabels, setShowLabels } =
    useTransactionsSummaryHistoryChart({
      data,
    });

  return (
    <>
      <div className="w-full flex flex-col p-5 rounded-xl shadow-md border-1 dark:shadow-none dark:border-0 dark:bg-zinc-900">
        <Switch
          defaultSelected
          size="sm"
          className="mb-2 self-end"
          isSelected={showLabels}
          onValueChange={setShowLabels}
        >
          {t("showLabels")}
        </Switch>
        <AgCharts options={options} />
      </div>
    </>
  );
};
