import React, { useState } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import { CategorySummary } from "@/interfaces/summary";
import { formatCurrency } from "@/config/utils";
import { useTheme } from "next-themes";

export interface CategoriesChartProps {
  data?: CategorySummary[];
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const [options, setOptions] = useState<AgChartOptions>({
    width: 500,
    height: 500,
    data,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "category",
        yKey: "total",
        label: {
          formatter: ({ value }) => formatCurrency(value),
        },
      },
    ],
    background: {
      fill: theme === "dark" ? "#18181B" : "#FFFFFF",
    },
  });

  return (
    <div className="w-full p-5 rounded-xl drop-shadow-md border-1 dark:drop-shadow-none dark:border-0 dark:bg-zinc-900">
      <AgCharts options={options} />
    </div>
  );
};
