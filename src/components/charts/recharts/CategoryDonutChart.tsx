"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Button,
  Chip,
  ProgressBar,
  Skeleton,
  Surface,
  Table,
} from "@heroui/react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import clsx from "clsx";
import stc from "string-to-color";
import { CategorySummary } from "@/interfaces/summary";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { formatCurrency, formatTimeDate } from "@/config/utils";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { ChartDetailsModal } from "../ChartDetailsModal";
import { TransactionTypeDecorator } from "@/components/shared/TransactionTypeDecorator";
import { EmptyTableState } from "@/components/shared/Table/EmptyTableState";

export interface CategoryDonutChartProps {
  data?: CategorySummary[];
  detail?: TransactionOutput[];
  trendPercentage?: number;
}

interface CategorySlice {
  category: string;
  total: number;
  percentage: number;
  icon: string;
  color: string;
}

const DEFAULT_CATEGORY_ICON = "🏷️";

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  detail,
  trendPercentage,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const [selectedCategory, setSelectedCategory] = useState<CategorySlice>();

  const slices = useMemo<CategorySlice[]>(() => {
    if (!data) {
      return [];
    }

    const expenseCategories = data.filter((category) => category.total < 0);
    const totalExpenses = expenseCategories.reduce(
      (sum, category) => sum + Math.abs(category.total),
      0
    );

    return expenseCategories
      .map((category) => {
        const total = Math.abs(category.total);
        const icon =
          detail?.find(
            (transaction) => transaction.category?.name === category.category
          )?.category?.icon ?? DEFAULT_CATEGORY_ICON;

        return {
          category: category.category,
          total,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
          icon,
          color: stc(category.category),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [data, detail]);

  const totalExpenses = slices.reduce((sum, slice) => sum + slice.total, 0);

  if (!data) {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
  }

  return (
    <Surface
      variant="default"
      className="w-full overflow-hidden rounded-2xl border border-border p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold">{t("categories.title")}</h3>
        <p className="text-xs text-muted">{t("categories.subtitle")}</p>
      </div>

      {slices.length === 0 ? (
        <p className="text-sm text-muted">{t("categories.noExpenses")}</p>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={4}
                  stroke="none"
                  cursor="pointer"
                  onClick={(_, index) => setSelectedCategory(slices[index])}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.category} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<CategoryTooltip />}
                  wrapperStyle={{ zIndex: 20, pointerEvents: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] uppercase tracking-wide text-muted">
                {t("categories.totalSpend")}
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(totalExpenses)}
              </span>
              {trendPercentage !== undefined && (
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    trendPercentage <= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {trendPercentage >= 0 ? "+" : ""}
                  {trendPercentage.toFixed(1)}% MoM
                </span>
              )}
            </div>
          </div>

          <CategoryBoxGrid slices={slices} onSelect={setSelectedCategory} />
        </div>
      )}

      {detail && selectedCategory && (
        <ChartDetailsModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(undefined)}
          title={
            <span>
              {t("categories.transactionsForCategory")}&nbsp;
              <Chip variant="tertiary" className="ml-2 rounded-sm">
                <span className="font-bold">{selectedCategory.category}</span>
              </Chip>
            </span>
          }
        >
          <CategoryDetailTable category={selectedCategory} detail={detail} />
        </ChartDetailsModal>
      )}
    </Surface>
  );
};

const CategoryTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: CategorySlice }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const slice = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-xs shadow-lg">
      <p className="font-bold">
        {slice.icon} {slice.category}
      </p>
      <p>{formatCurrency(slice.total)}</p>
      <p className="text-muted">{slice.percentage.toFixed(1)}%</p>
    </div>
  );
};

const CATEGORIES_PAGE_SIZE = 6;

const CategoryBoxGrid: React.FC<{
  slices: CategorySlice[];
  onSelect: (slice: CategorySlice) => void;
}> = ({ slices, onSelect }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [slices]);

  const pageCount = Math.ceil(slices.length / CATEGORIES_PAGE_SIZE);
  const visibleSlices = slices.slice(
    page * CATEGORIES_PAGE_SIZE,
    page * CATEGORIES_PAGE_SIZE + CATEGORIES_PAGE_SIZE
  );

  return (
    <div className="flex w-full items-stretch gap-2">
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
        {visibleSlices.map((slice) => (
          <button
            key={slice.category}
            type="button"
            onClick={() => onSelect(slice)}
            aria-label={`${slice.category} ${t("categories.ofTotal")}`}
            className="flex min-w-0 flex-col gap-2 rounded-xl border border-border p-3 text-left hover:bg-surface-secondary"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 truncate text-sm font-medium">
                {slice.icon} {slice.category}
              </span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">
                {formatCurrency(slice.total)}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {slice.percentage.toFixed(0)}%
              </span>
            </span>
            <ProgressBar
              aria-hidden
              size="sm"
              value={slice.percentage}
              className="pointer-events-none"
            >
              <ProgressBar.Track className="bg-muted/20">
                <ProgressBar.Fill style={{ backgroundColor: slice.color }} />
              </ProgressBar.Track>
            </ProgressBar>
          </button>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex shrink-0 flex-col items-center justify-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="tertiary"
            isDisabled={page === 0}
            aria-label={t("categories.previousPage")}
            onPress={() => setPage((p) => Math.max(p - 1, 0))}
          >
            <HiChevronUp />
          </Button>
          <span className="text-[10px] text-muted">
            {page + 1}/{pageCount}
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="tertiary"
            isDisabled={page === pageCount - 1}
            aria-label={t("categories.nextPage")}
            onPress={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
          >
            <HiChevronDown />
          </Button>
        </div>
      )}
    </div>
  );
};

const CategoryDetailTable: React.FC<{
  category: CategorySlice;
  detail: TransactionOutput[];
}> = ({ category, detail }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  const transactions = detail.filter(
    (transaction) => transaction.category?.name === category.category
  );

  return (
    <>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Category detail">
            <Table.Header>
              <Table.Column id="description" isRowHeader>
                {t("description")}
              </Table.Column>
              <Table.Column id="date">{t("date")}</Table.Column>
              <Table.Column id="amount" className="text-end">
                {t("amount")}
              </Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyTableState message={t("emptyContent")} />
              )}
            >
              {transactions.map((transaction) => (
                <Table.Row key={transaction.id} id={transaction.id}>
                  <Table.Cell>{transaction.description}</Table.Cell>
                  <Table.Cell>
                    {formatTimeDate(new Date(transaction.createdAt))}
                  </Table.Cell>
                  <Table.Cell className="text-end">
                    <TransactionTypeDecorator type={transaction.type}>
                      {formatCurrency(transaction.amount)}
                    </TransactionTypeDecorator>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <div className="mt-2 text-end">
        <TransactionTypeDecorator color="accent">
          <span className="font-bold">
            {t("total")}:&nbsp;
            {formatCurrency(category.total)}
          </span>
        </TransactionTypeDecorator>
      </div>
    </>
  );
};
