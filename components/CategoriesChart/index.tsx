import React, { useState } from "react";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";
import { CategorySummary } from "@/interfaces/summary";

export interface CategoriesChartProps {
  data?: CategorySummary[];
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({ data }) => {
  const [options, setOptions] = useState<AgChartOptions>({
    width: 500,
    height: 800,
    title: {
      text: "Apple's Revenue by Product Category",
    },
    subtitle: {
      text: "In Billion U.S. Dollars",
    },
    data,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "category",
        yKey: "total",
      },
    ],
  });

  return <AgCharts options={options} className="dark: bg-zinc-500" />;
};
