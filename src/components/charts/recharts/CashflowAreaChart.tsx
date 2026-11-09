"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Skeleton,
  Surface,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { CashflowPoint } from "@/interfaces/summary";
import { formatCurrency } from "@/config/utils";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export interface CashflowAreaChartProps {
  data?: CashflowPoint[];
}

interface ChartPoint extends Omit<CashflowPoint, "netFlow"> {
  netFlow?: number;
  netFlowForecast?: number;
}

type NetFlowViewMode = "perMonth" | "cumulative";

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(value);

const monthTickFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

// `date` is "YYYY-MM" and unique per point, unlike `monthLabel` ("Nov", "Dec", ...)
// which repeats once the 12-month trailing history + forecast spans more than a
// calendar year. Recharts' category axis resolves things like ReferenceLine's `x`
// and the active/hovered point by matching the axis dataKey's *value*, so a
// repeated "Nov" would resolve to the wrong (first) occurrence.
const formatMonthTick = (value: string) =>
  monthTickFormatter.format(new Date(`${value}-01T00:00:00`));

export const CashflowAreaChart: React.FC<CashflowAreaChartProps> = ({
  data,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const [viewMode, setViewMode] = useState<NetFlowViewMode>("perMonth");

  const { chartData, forecastStartDate } = useMemo(() => {
    const points = data ?? [];
    const firstForecastIndex = points.findIndex((point) => point.isForecast);
    const bridgeIndex = firstForecastIndex > 0 ? firstForecastIndex - 1 : -1;

    // In "cumulative" mode, each point's net flow is the running total of every
    // prior point's net flow (oldest historical month through the forecast
    // months, in order), rather than that month's own isolated surplus/deficit.
    let runningTotal = 0;
    const resolvedNetFlow = points.map((point) => {
      if (viewMode !== "cumulative") {
        return point.netFlow;
      }
      runningTotal += point.netFlow;
      return runningTotal;
    });

    const mapped: ChartPoint[] = points.map((point, index) => ({
      ...point,
      netFlow: point.isForecast ? undefined : resolvedNetFlow[index],
      netFlowForecast:
        point.isForecast || index === bridgeIndex
          ? resolvedNetFlow[index]
          : undefined,
    }));

    return {
      chartData: mapped,
      forecastStartDate:
        firstForecastIndex >= 0 ? points[firstForecastIndex].date : undefined,
    };
  }, [data, viewMode]);

  if (!data) {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
  }

  const netFlowLabel =
    viewMode === "cumulative"
      ? `${t("cashflow.netFlow")} (${t("cashflow.viewMode.cumulative")})`
      : t("cashflow.netFlow");

  return (
    <Surface
      variant="default"
      className="w-full rounded-2xl border border-border p-5"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold">{t("cashflow.title")}</h3>
          <p className="text-xs text-muted">{t("cashflow.subtitle")}</p>
        </div>
        <ToggleButtonGroup
          size="sm"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[viewMode]}
          onSelectionChange={(keys) =>
            setViewMode([...keys][0] as NetFlowViewMode)
          }
        >
          <ToggleButton id="perMonth">
            {t("cashflow.viewMode.perMonth")}
          </ToggleButton>
          <ToggleButton id="cumulative">
            <ToggleButtonGroup.Separator />
            {t("cashflow.viewMode.cumulative")}
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonthTick}
            stroke="var(--muted)"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            stroke="var(--muted)"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={formatCompactCurrency}
            width={48}
          />
          {forecastStartDate && (
            <ReferenceLine
              x={forecastStartDate}
              stroke="var(--border)"
              strokeDasharray="4 4"
              label={{
                value: t("cashflow.forecast"),
                position: "insideTopRight",
                fill: "var(--muted)",
                fontSize: 11,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="incomes"
            name={t("cashflow.incomes")}
            stroke="var(--success)"
            fill="url(#incomeGlow)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name={t("cashflow.expenses")}
            stroke="var(--danger)"
            fill="url(#expenseGlow)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="netFlow"
            name={netFlowLabel}
            stroke="var(--warning)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="netFlowForecast"
            stroke="var(--warning)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            legendType="none"
            connectNulls
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip content={<CashflowTooltip netFlowLabel={netFlowLabel} />} />
        </AreaChart>
      </ResponsiveContainer>
    </Surface>
  );
};

interface CashflowTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  netFlowLabel?: string;
}

const CashflowTooltip: React.FC<CashflowTooltipProps> = ({
  active,
  payload,
  netFlowLabel,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);

  if (!active || !payload?.length) {
    return null;
  }

  // Read the label from the hovered point itself (not the axis `label` prop) so
  // it stays tied to the exact point, rather than an axis category value that
  // can repeat across years (see `formatMonthTick` above).
  const point = payload[0].payload;
  const netFlow = point.netFlow ?? point.netFlowForecast ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-xs shadow-lg">
      <p className="mb-1 font-bold">
        {point.monthLabel}
        {point.isForecast ? ` · ${t("cashflow.forecast")}` : ""}
      </p>
      <p className="text-success">
        {t("cashflow.incomes")}: {formatCurrency(point.incomes)}
      </p>
      <p className="text-danger">
        {t("cashflow.expenses")}: {formatCurrency(point.expenses)}
      </p>
      <p className="font-semibold text-warning">
        {netFlowLabel ?? t("cashflow.netFlow")}: {formatCurrency(netFlow)}
      </p>
    </div>
  );
};
