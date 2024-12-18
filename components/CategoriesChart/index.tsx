"use client";

import React, { useEffect, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AgBarSeriesThemeableOptions,
  AgChartOptions,
} from "ag-charts-community";
import stc from "string-to-color";
import { CategorySummary } from "@/interfaces/summary";
import { formatCurrency } from "@/config/utils";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface CategoriesChartProps {
  data?: CategorySummary[];
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const sortedData = data?.toSorted((a, b) => b.total - a.total);

  const [options, setOptions] = useState<AgChartOptions>({
    width: isMobile ? 350 : 500,
    height: isMobile ? 350 : 500,
    data: sortedData,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "category",
        yKey: "total",
        cornerRadius: 5,
        itemStyler: ({ xValue }) => ({
          fill: stc(xValue),
          fillOpacity: 0.6,
        }),
        label: {
          formatter: ({ value }) => formatCurrency(value),
          color: "#FFFFFF",
          padding: 15,
          fontWeight: "normal",
          placement: "inside-start",
        },
        tooltip: {
          enabled: true,
          renderer: ({ datum }) =>
            `${datum.category} ${formatCurrency(datum.total)}`,
        },
      },
    ],
    axes: [
      {
        type: "category",
        position: "left",
      },
      {
        type: "number",
        position: "bottom",
      },
    ],
    overlays: {
      unsupportedBrowser: {
        enabled: false,
      },
    },
    theme: "ag-financial-dark",
  });

  useEffect(() => {
    setOptions((prev) => {
      const serie =
        prev.series![0] as AgBarSeriesThemeableOptions<CategorySummary>;
      serie.label = {
        ...serie.label,
        color: theme === "dark" ? "#FFFFFF" : "#18181B",
      };

      return {
        ...prev,
        background: {
          fill: theme === "dark" ? "#18181B" : "#FFFFFF",
        },
        series: [serie as any],
        theme: theme === "dark" ? "ag-financial-dark" : "ag-financial",
      };
    });
  }, [theme]);

  return (
    <div className="w-full p-5 rounded-xl shadow-md border-1 dark:shadow-none dark:border-0 dark:bg-zinc-900">
      <AgCharts options={options} />
    </div>
  );
};
