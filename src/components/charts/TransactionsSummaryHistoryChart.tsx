"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import { TransactionsSummaryHistory } from "@/interfaces/account";
import { useTransactionsSummaryHistoryChart } from "@/hooks/charts/useTransactionsSummaryHistoryChart";

export interface TransactionsSummaryHistoryChartProps {
  data?: TransactionsSummaryHistory[];
}

export const TransactionsSummaryHistoryChart: React.FC<
  TransactionsSummaryHistoryChartProps
> = ({ data }) => {
  const { options } = useTransactionsSummaryHistoryChart({ data });

  return (
    <>
      <div className="w-full p-5 rounded-xl shadow-md border-1 dark:shadow-none dark:border-0 dark:bg-zinc-900">
        <AgCharts options={options} />
      </div>
    </>
  );
};
