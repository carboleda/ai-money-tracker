"use client";

import React from "react";
import { AgCharts } from "ag-charts-react";
import { CategorySummary } from "@/interfaces/summary";
import { useCategoryChart } from "@/hooks/charts/useCategoryChart";

export interface CategoriesChartProps {
  data?: CategorySummary[];
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({ data }) => {
  const { options } = useCategoryChart({ data });

  return (
    <div className="w-full p-5 rounded-xl shadow-md border-1 dark:shadow-none dark:border-0 dark:bg-zinc-900">
      <AgCharts options={options} />
    </div>
  );
};
