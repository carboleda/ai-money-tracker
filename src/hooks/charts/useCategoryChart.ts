import {
  AgBarSeriesThemeableOptions,
  AgNodeClickEvent,
} from "ag-charts-community";
import { AgChartOptions } from "ag-charts-community";
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
  onCategoryClick?: (category: CategorySummary) => void;
}

export interface CategoriesChartResult {
  options: AgChartOptions;
}

export const useCategoryChart = ({
  data,
  onCategoryClick,
}: CategoriesChartProps) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const isDark = theme === "dark";

  const [options, setOptions] = useState<AgChartOptions>({
    width: isMobile ? 350 : 500,
    height: isMobile ? 350 : 500,
    data: [],
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "category",
        yKey: "total",
        cornerRadius: 5,
        itemStyler: ({ xValue }: { xValue: string }) => ({
          fill: stc(xValue),
          fillOpacity: 0.6,
        }),
        label: {
          formatter: ({ value }: { value: number }) => formatCurrency(value),
          color: ligthColor,
          padding: 15,
          fontWeight: "normal",
          placement: "inside-start",
        },
        tooltip: {
          enabled: true,
          renderer: ({ datum }: { datum: CategorySummary }) =>
            `${datum.category} ${formatCurrency(datum.total)}`,
        },
        listeners: {
          seriesNodeClick: (
            event: AgNodeClickEvent<"seriesNodeClick", CategorySummary>
          ) => onCategoryClick && onCategoryClick(event.datum),
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
  });

  useEffect(() => {
    const sortedData = data?.toSorted((a, b) => b.total - a.total);
    setOptions((prev: any) => {
      return {
        ...prev,
        data: sortedData,
      };
    });
  }, [data]);

  useEffect(() => {
    setOptions((prev: any) => {
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
