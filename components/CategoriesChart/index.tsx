"use client";

import React, { useEffect, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  AgBarSeriesLabelOptions,
  AgBarSeriesThemeableOptions,
  AgChartOptions,
} from "ag-charts-community";
import { CategorySummary } from "@/interfaces/summary";
import { formatCurrency } from "@/config/utils";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/useIsMobile";
import { TransactionCategory } from "@/interfaces/transaction";

export interface CategoriesChartProps {
  data?: CategorySummary[];
}

const getCategoryColor = (category: TransactionCategory): string => {
  switch (category) {
    case TransactionCategory.Salario:
      return "#31ba4d";
    case TransactionCategory.TC:
      return "#9c3f53";
    case TransactionCategory.Alimentos:
      return "#FF6384";
    case TransactionCategory.Mercado:
      return "#36A2EB";
    case TransactionCategory.Educacion:
      return "#FFCE56";
    case TransactionCategory.Inversion:
      return "#4BC0C0";
    case TransactionCategory.Salud:
      return "#9966FF";
    case TransactionCategory.Servicios:
      return "#FF9F40";
    case TransactionCategory.Transporte:
      return "#FFCD56";
    case TransactionCategory.Vivienda:
      return "#4BC0C0";
    case TransactionCategory.Bebe:
      return "#FF6384";
    case TransactionCategory.Zeus:
      return "#36A2EB";
    case TransactionCategory.Ocio:
      return "#FFCE56";
    case TransactionCategory.Impuesto:
      return "#9966FF";
    case TransactionCategory.Retiros:
      return "#FF9F40";
    case TransactionCategory.Vestuario:
      return "#FFCD56";
    case TransactionCategory.Otros:
      return "#4BC0C0";
    default:
      return "#56aac9";
  }
};

export const CategoriesChart: React.FC<CategoriesChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const [options, setOptions] = useState<AgChartOptions>({
    ...(!isMobile && { width: 500, height: 500 }),
    ...(isMobile && { width: 350, height: 500 }),
    data,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "category",
        yKey: "total",
        cornerRadius: 5,
        itemStyler: ({ yKey, xValue }) => ({
          fill: getCategoryColor(xValue),
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
    theme: "ag-financial-dark",
  });

  useEffect(() => {
    setOptions((prev) => {
      const serie =
        prev.series![0] as AgBarSeriesThemeableOptions<CategorySummary>;
      serie.label!.color = theme === "dark" ? "#FFFFFF" : "#000000";
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
    <div className="w-full p-5 rounded-xl drop-shadow-md border-1 dark:drop-shadow-none dark:border-0 dark:bg-zinc-900">
      <AgCharts options={options} />
    </div>
  );
};
