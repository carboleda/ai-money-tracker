import {
  AgBarSeriesThemeableOptions,
  AgChartOptions,
} from "ag-charts-community";
import { CategorySummary } from "@/interfaces/summary";
import { useTheme } from "next-themes";
import { useIsMobile } from "../useIsMobile";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/config/utils";
import stc from "string-to-color";

const ligthColor = "#FFFFFF";
const darkColor = "#18181B";

export interface CategoriesChartProps {
  data?: CategorySummary[];
}

export interface CategoriesChartResult {
  options: AgChartOptions;
}

export const useCategoryChart = ({ data }: CategoriesChartProps) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const isDark = theme === "dark";
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
          color: ligthColor,
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
        label: {
          formatter: ({ value }) => `${formatCurrency(value / 1000, false)}K`,
        },
      },
    ],
    overlays: {
      unsupportedBrowser: {
        enabled: false,
      },
    },
  });

  useEffect(() => {
    setOptions((prev) => {
      const serie =
        prev.series![0] as AgBarSeriesThemeableOptions<CategorySummary>;
      serie.label = {
        ...serie.label,
        color: isDark ? ligthColor : darkColor,
      };

      return {
        ...prev,
        background: {
          fill: isDark ? darkColor : ligthColor,
        },
        series: [serie as any],
        theme: isDark ? "ag-financial-dark" : "ag-financial",
      };
    });
  }, [isDark]);

  return { options };
};
