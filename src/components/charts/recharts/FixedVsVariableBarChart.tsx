"use client";

import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton, Surface } from "@heroui/react";
import { RecurringVsVariable } from "@/interfaces/summary";
import { formatCurrency } from "@/config/utils";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export interface FixedVsVariableBarChartProps {
  data?: RecurringVsVariable;
}

const getTotalFor = (
  data: RecurringVsVariable,
  type: "recurrent" | "variable"
): number => data.total.find((entry) => entry.type === type)?.value ?? 0;

export const FixedVsVariableBarChart: React.FC<
  FixedVsVariableBarChartProps
> = ({ data }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);

  if (!data) {
    return <Skeleton className="h-32 w-full rounded-2xl" />;
  }

  const recurringTotal = getTotalFor(data, "recurrent");
  const variableTotal = getTotalFor(data, "variable");
  const combinedTotal = recurringTotal + variableTotal;
  const recurringPercentage =
    combinedTotal > 0 ? (recurringTotal / combinedTotal) * 100 : 0;
  const variablePercentage = combinedTotal > 0 ? 100 - recurringPercentage : 0;

  const chartData = [
    { name: "total", recurring: recurringTotal, variable: variableTotal },
  ];

  return (
    <Surface
      variant="default"
      className="w-full rounded-2xl border border-border p-5"
    >
      <h3 className="mb-4 text-sm font-bold">
        {t("recurringVsVariable.title")}
      </h3>
      <ResponsiveContainer width="100%" height={36}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            cursor={false}
            content={<RecurringVsVariableTooltip />}
            wrapperStyle={{ zIndex: 20 }}
          />
          <Bar
            dataKey="recurring"
            stackId="a"
            fill="var(--warning)"
            radius={[8, 0, 0, 8]}
            barSize={28}
          />
          <Bar
            dataKey="variable"
            stackId="a"
            fill="var(--accent)"
            radius={[0, 8, 8, 0]}
            barSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-warning" />
          <span className="truncate">{t("recurringVsVariable.recurring")}</span>
          <span className="shrink-0 font-semibold">
            {formatCurrency(recurringTotal)}
          </span>
          <span className="shrink-0 text-muted">
            ({recurringPercentage.toFixed(0)}%)
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{t("recurringVsVariable.variable")}</span>
          <span className="shrink-0 font-semibold">
            {formatCurrency(variableTotal)}
          </span>
          <span className="shrink-0 text-muted">
            ({variablePercentage.toFixed(0)}%)
          </span>
        </span>
      </div>
    </Surface>
  );
};

interface RecurringVsVariableTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { recurring: number; variable: number } }>;
}

const RecurringVsVariableTooltip: React.FC<
  RecurringVsVariableTooltipProps
> = ({ active, payload }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);

  if (!active || !payload?.length) {
    return null;
  }

  const { recurring, variable } = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-xs shadow-lg">
      <p className="text-warning">
        {t("recurringVsVariable.recurring")}: {formatCurrency(recurring)}
      </p>
      <p className="text-accent">
        {t("recurringVsVariable.variable")}: {formatCurrency(variable)}
      </p>
    </div>
  );
};
