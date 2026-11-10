"use client";

import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { Skeleton, Surface } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { formatCurrency, formatRelativeDate } from "@/config/utils";
import { CustomIcon } from "@/components/shared/CustomIcon";

export interface RecentTransactionsTileProps {
  transactions?: TransactionOutput[];
}

const SIGN_BY_TYPE: Record<TransactionType, number> = {
  [TransactionType.INCOME]: 1,
  [TransactionType.EXPENSE]: -1,
  [TransactionType.TRANSFER]: -1,
};

const COLOR_CLASS_BY_TYPE: Record<TransactionType, string> = {
  [TransactionType.INCOME]: "text-success",
  [TransactionType.EXPENSE]: "text-danger",
  [TransactionType.TRANSFER]: "text-warning",
};

export const RecentTransactionsTile: React.FC<RecentTransactionsTileProps> = ({
  transactions,
}) => {
  const { t } = useTranslation(LocaleNamespace.Summary);

  if (!transactions) {
    return <Skeleton className="h-full min-h-80 w-full rounded-2xl" />;
  }

  return (
    <Surface
      variant="default"
      className="flex h-full flex-col rounded-2xl border border-border p-5"
    >
      <h3 className="mb-3 text-sm font-bold">
        {t("recentTransactions.title")}
      </h3>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted">
          {t("recentTransactions.noTransactions")}
        </p>
      ) : (
        <ul className="flex flex-col">
          {transactions.map((transaction) => {
            const signedAmount =
              transaction.amount * SIGN_BY_TYPE[transaction.type];

            return (
              <li
                key={transaction.id}
                className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface-secondary"
              >
                <CustomIcon icon={transaction.category?.icon} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {transaction.description}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {formatRelativeDate(new Date(transaction.createdAt))}
                  </span>
                </div>
                <span
                  className={clsx(
                    "shrink-0 text-sm font-semibold",
                    COLOR_CLASS_BY_TYPE[transaction.type]
                  )}
                >
                  {signedAmount >= 0 ? "+" : ""}
                  {formatCurrency(signedAmount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/private/transactions"
        className="mt-2 block border-t border-border pt-2 text-center text-xs font-semibold text-accent hover:underline"
      >
        {t("recentTransactions.viewAll")}
      </Link>
    </Surface>
  );
};
