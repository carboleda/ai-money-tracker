"use client";

import React from "react";
import clsx from "clsx";
import { Chip, Skeleton, Surface } from "@heroui/react";
import {
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiArrowsRightLeft,
  HiOutlineBuildingLibrary,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import {
  CashflowPoint,
  SummaryTrends,
  TypeSummary,
} from "@/interfaces/summary";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { formatCurrency } from "@/config/utils";
import { Sparkline } from "@/components/charts/recharts/Sparkline";

export interface SummaryMetricsStripProps {
  totalBalance?: number;
  trends?: SummaryTrends;
  byType?: TypeSummary[];
  cashflow?: CashflowPoint[];
}

const getTypeTotal = (byType: TypeSummary[], type: TransactionType): number =>
  byType.find((entry) => entry.type === type)?.total ?? 0;

export const SummaryMetricsStrip: React.FC<SummaryMetricsStripProps> = ({
  totalBalance,
  trends,
  byType,
  cashflow,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);

  if (totalBalance === undefined || !trends || !byType) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const incomes = getTypeTotal(byType, TransactionType.INCOME);
  const expenses = getTypeTotal(byType, TransactionType.EXPENSE);
  const transfers = getTypeTotal(byType, TransactionType.TRANSFER);
  const historicalPoints = (cashflow ?? []).filter(
    (point) => !point.isForecast,
  );

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetricCard
        label={t("metrics.overallBalance")}
        amount={totalBalance}
        icon={<HiOutlineBuildingLibrary />}
        iconClassName="bg-accent/15 text-accent"
        trendPercentage={trends.balance.percentageChange}
      />
      <MetricCard
        label={t("metrics.incomes")}
        amount={incomes}
        colorClassName="text-success"
        icon={<HiArrowTrendingUp />}
        iconClassName="bg-success/15 text-success"
        inlinePercentage={trends.incomes.percentageChange}
        inlinePercentageIsGood={trends.incomes.percentageChange >= 0}
        sparklineColor="var(--success)"
        sparklineData={historicalPoints.map((point) => point.incomes)}
      />
      <MetricCard
        label={t("metrics.expenses")}
        amount={expenses}
        colorClassName="text-danger"
        icon={<HiArrowTrendingDown />}
        iconClassName="bg-danger/15 text-danger"
        inlinePercentage={trends.expenses.percentageChange}
        inlinePercentageIsGood={trends.expenses.percentageChange <= 0}
        sparklineColor="var(--danger)"
        sparklineData={historicalPoints.map((point) => point.expenses)}
      />
      <MetricCard
        label={t("metrics.transfers")}
        amount={transfers}
        colorClassName="text-warning"
        icon={<HiArrowsRightLeft />}
        iconClassName="bg-warning/15 text-warning"
        sparklineColor="var(--warning)"
        sparklineData={historicalPoints.map((point) => point.transfers)}
      />
    </div>
  );
};

interface MetricCardProps {
  label: string;
  amount: number;
  icon: React.ReactNode;
  iconClassName: string;
  colorClassName?: string;
  trendPercentage?: number;
  inlinePercentage?: number;
  inlinePercentageIsGood?: boolean;
  sparklineColor?: string;
  sparklineData?: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  amount,
  icon,
  iconClassName,
  colorClassName,
  trendPercentage,
  inlinePercentage,
  inlinePercentageIsGood,
  sparklineColor,
  sparklineData,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const isTrendPositive = (trendPercentage ?? 0) >= 0;

  return (
    <Surface
      variant="default"
      className="flex flex-col gap-1.5 rounded-2xl border border-border p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{label}</span>
        <span
          className={clsx(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-base",
            iconClassName,
          )}
        >
          {icon}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={clsx("text-lg font-bold md:text-xl", colorClassName)}>
          {formatCurrency(amount)}
        </span>
        {inlinePercentage !== undefined && (
          <span
            className={clsx(
              "text-xs font-semibold",
              inlinePercentageIsGood ? "text-success" : "text-danger",
            )}
          >
            {inlinePercentage >= 0 ? "+" : ""}
            {inlinePercentage.toFixed(1)}%
          </span>
        )}
      </div>

      {trendPercentage !== undefined && (
        <Chip
          className={clsx(
            "inline-flex w-fit items-center gap-1 text-xs font-semibold",
            isTrendPositive
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger",
          )}
        >
          {isTrendPositive ? <HiArrowTrendingUp /> : <HiArrowTrendingDown />}
          {Math.abs(trendPercentage).toFixed(1)}% {t("metrics.vsLastPeriod")}
        </Chip>
      )}

      {sparklineColor && sparklineData && sparklineData.length > 1 && (
        <Sparkline data={sparklineData} color={sparklineColor} />
      )}
    </Surface>
  );
};
