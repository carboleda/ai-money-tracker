import {
  AgBarSeriesThemeableOptions,
  AgChartOptions,
} from "ag-charts-community";
import { RecurrentVsVariable } from "@/interfaces/summary";
import { useTheme } from "next-themes";
import { useIsMobile } from "../useIsMobile";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/config/utils";

const ligthColor = "#FFFFFF";
const darkColor = "#18181B";

export interface FixedVsVariableChartProps {
  data?: RecurrentVsVariable;
}

export interface FixedVsVariableChartResult {
  options: AgChartOptions;
}

export const useFixedVsVariableChart = ({
  data,
}: FixedVsVariableChartProps) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const isDark = theme === "dark";

  const [options, setOptions] = useState<AgChartOptions>({
    width: isMobile ? 350 : 500,
    height: isMobile ? 350 : 500,
    data: [],
    series: [
      {
        data: data?.count,
        type: "donut",
        title: {
          text: "Amount of transactions",
          showInLegend: true,
        },
        calloutLabelKey: "typeLabel",
        angleKey: "value",
        outerRadiusRatio: 1,
        innerRadiusRatio: 0.9,
        tooltip: {
          renderer({ datum, calloutLabelKey, angleKey }: any) {
            return {
              data: [
                {
                  label: datum[calloutLabelKey],
                  value: datum[angleKey],
                },
              ],
            };
          },
        },
      },
      {
        data: data?.total,
        type: "donut",
        title: {
          text: "Total transactions",
        },
        calloutLabelKey: "typeLabel",
        angleKey: "value",
        showInLegend: false,
        outerRadiusRatio: 0.6,
        innerRadiusRatio: 0.2,
        tooltip: {
          renderer({ datum, sectorLabelKey, angleKey }: any) {
            return {
              data: [
                {
                  label: datum[sectorLabelKey],
                  value: formatCurrency(datum[angleKey]),
                },
              ],
            };
          },
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
    setOptions((prev: any) => {
      const series = [...prev.series];
      series[0].data = data?.count?.map((entry) => ({
        ...entry,
        typeLabel: entry.type === "recurrent" ? "Recurrent" : "Variable",
      }));
      series[1].data = data?.total?.map((entry) => ({
        ...entry,
        typeLabel: entry.type === "recurrent" ? "Recurrent" : "Variable",
      }));

      return {
        ...prev,
        series,
      };
    });
  }, [data]);

  useEffect(() => {
    setOptions((prev: any) => {
      const series = prev.series.map(
        (serie: AgBarSeriesThemeableOptions<RecurrentVsVariable>) => {
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
