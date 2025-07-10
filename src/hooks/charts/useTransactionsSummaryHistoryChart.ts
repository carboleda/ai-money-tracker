import {
  AgBarSeriesThemeableOptions,
  AgChartLegendClickEvent,
  AgChartOptions,
} from "ag-charts-community";
import { useTheme } from "next-themes";
import { useIsMobile } from "../useIsMobile";
import { useEffect, useState } from "react";
import { TransactionsSummaryHistory } from "@/interfaces/account";
import { formatCurrency, formatMonthYear } from "@/config/utils";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const ligthColor = "#FFFFFF";
const darkColor = "#18181B";
const greenColor = "#17c964";
const redColor = "#f54180";
const yellowColor = "#f5a524";
const blueColor = "#66aaf9";

export interface UseTransactionsSummaryHistoryChartProps {
  data?: TransactionsSummaryHistory[];
}

export interface UseTransactionsSummaryHistoryChartResult {
  options: AgChartOptions;
}

type LegendName = "incomes" | "expenses" | "transfers" | "balance";

interface ChartConfigStore {
  showLabels: boolean;
  legend: {
    incomes: boolean;
    expenses: boolean;
    transfers: boolean;
    balance: boolean;
  };
  setLegend: (name: LegendName) => void;
  setShowLabels: (showLabels: boolean) => void;
}

const useLegendStore = create<ChartConfigStore>()(
  persist(
    (set, get) => ({
      showLabels: false,
      legend: {
        incomes: false,
        expenses: true,
        transfers: false,
        balance: false,
      },
      setLegend: (name: LegendName) => {
        const legend = get().legend;
        set({ legend: { ...legend, [name]: !legend[name] } });
      },
      setShowLabels: (showLabels: boolean) => set({ showLabels }),
    }),
    {
      name: "transactions-summary-history-config-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export const useTransactionsSummaryHistoryChart = ({
  data,
}: UseTransactionsSummaryHistoryChartProps) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { setLegend, setShowLabels, showLabels, legend } = useLegendStore();

  const isDark = theme === "dark";

  const [options, setOptions] = useState<AgChartOptions>({
    height: isMobile ? 200 : 350,
    padding: {
      top: 10,
      right: 5,
      // bottom: 20,
      // left: 20,
    },
    data: [],
    series: [
      {
        type: "line",
        xKey: "month",
        xName: "Month",
        yKey: "incomes",
        yName: t("incomes"),
        visible: legend.incomes,
        interpolation: { type: "smooth" },
        stroke: greenColor,
        marker: {
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
          enabled: showLabels,
        },
      },
      {
        type: "line",
        xKey: "month",
        yKey: "expenses",
        yName: t("expenses"),
        visible: legend.expenses,
        interpolation: { type: "smooth" },
        stroke: redColor,
        marker: {
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
          enabled: showLabels,
        },
      },
      {
        type: "line",
        xKey: "month",
        yKey: "transfers",
        yName: t("transfers"),
        visible: legend.transfers,
        interpolation: { type: "smooth" },
        stroke: yellowColor,
        marker: {
          fill: yellowColor,
          stroke: yellowColor,
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
          enabled: showLabels,
        },
      },
      {
        type: "line",
        xKey: "month",
        yKey: "balance",
        yName: t("balances"),
        visible: legend.balance,
        interpolation: { type: "smooth" },
        stroke: blueColor,
        marker: {
          fill: blueColor,
          stroke: blueColor,
          strokeWidth: 3,
          shape: "diamond",
        },
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          fontWeight: "normal",
          enabled: showLabels,
        },
      },
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
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
    overlays: {
      unsupportedBrowser: {
        enabled: false,
      },
    },
    legend: {
      listeners: {
        legendItemClick: ({ seriesId, itemId }: AgChartLegendClickEvent) => {
          console.log(`seriesId: ${seriesId}, itemId: ${itemId}`);
          setLegend(itemId as LegendName);
        },
      },
    },
  });

  useEffect(() => {
    setOptions((prev: any) => {
      return {
        ...prev,
        data: data?.map((item) => ({
          ...item,
          balance: item.incomes - item.expenses,
          month: formatMonthYear(new Date(item.createdAt)),
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
              enabled: showLabels,
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
  }, [isDark, showLabels]);

  return { options, showLabels, setShowLabels };
};
