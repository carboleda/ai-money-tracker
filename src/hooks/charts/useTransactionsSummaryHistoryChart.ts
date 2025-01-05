import {
  AgBarSeriesThemeableOptions,
  AgChartLabelOptions,
  AgChartOptions,
  AgRadialSeriesLabelFormatterParams,
  time,
} from "ag-charts-community";
import { useTheme } from "next-themes";
import { useIsMobile } from "../useIsMobile";
import { useEffect, useState } from "react";
import { TransactionsSummaryHistory } from "@/interfaces/account";
import { formatCurrency, formatDate, formatMonth } from "@/config/utils";

const ligthColor = "#FFFFFF";
const darkColor = "#18181B";

export interface UseTransactionsSummaryHistoryChartProps {
  data?: TransactionsSummaryHistory[];
}

export interface UseTransactionsSummaryHistoryChartResult {
  options: AgChartOptions;
}

export const useTransactionsSummaryHistoryChart = ({
  data,
}: UseTransactionsSummaryHistoryChartProps) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const isDark = theme === "dark";

  const [options, setOptions] = useState<AgChartOptions>({
    height: isMobile ? 200 : 350,
    padding: {
      top: 20,
      right: 50,
      bottom: 20,
      left: 20,
    },
    data: [],
    series: [
      {
        type: "line",
        xKey: "createdAt",
        xName: "Month",
        yKey: "incomes",
        yName: "Incomes",
        interpolation: { type: "smooth" },
        stroke: "green",
        marker: {
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
        },
      },
      {
        type: "line",
        xKey: "createdAt",
        yKey: "expenses",
        yName: "Expenses",
        interpolation: { type: "smooth" },
        stroke: "red",
        marker: {
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
        },
      },
      {
        type: "line",
        xKey: "createdAt",
        yKey: "transfers",
        yName: "Transfers",
        interpolation: { type: "smooth" },
        stroke: "orange",
        marker: {
          fill: "orange",
          stroke: "orange",
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
        },
      },
    ],
    axes: [
      {
        type: "time",
        position: "bottom",
        nice: true,
        interval: {
          step: time.month,
        },
        label: {
          format: "%b %Y",
        },
      },
      {
        type: "number",
        position: "left",
        label: {
          formatter: ({ value }: { value: number }) =>
            `${formatCurrency(value / 1000, false)}K`,
        },
      },
    ],
  });

  useEffect(() => {
    setOptions((prev: any) => {
      return {
        ...prev,
        data: data?.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })),
      };
    });
  }, [data]);

  useEffect(() => {
    setOptions((prev: any) => {
      const series = prev.series.map(
        (serie: AgBarSeriesThemeableOptions<TransactionsSummaryHistory>) => {
          return {
            ...serie,
            label: {
              ...serie.label,
              color: isDark ? ligthColor : darkColor,
            },
          };
        }
      );

      return {
        ...prev,
        background: {
          fill: isDark ? darkColor : ligthColor,
        },
        theme: isDark ? "ag-financial-dark" : "ag-financial",
        series,
      };
    });
  }, [isDark]);

  return { options };
};
