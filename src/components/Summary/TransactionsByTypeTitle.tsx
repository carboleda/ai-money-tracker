"use client";

import React from "react";
import { Color, TileTable } from "@/components/Summary/TileTable";

import { Skeleton } from "@heroui/skeleton";
import { TypeSummary } from "@/interfaces/summary";
import { TransactionType } from "@/interfaces/transaction";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export interface TransactionsByTypeTitleProps {
  byType?: TypeSummary[];
}

export const TransactionsByTypeTitle: React.FC<
  TransactionsByTypeTitleProps
> = ({ byType }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);

  if (!byType) {
    return (
      <Skeleton className="rounded-lg w-full">
        <div className="h-40 rounded-lg bg-default-200"></div>
      </Skeleton>
    );
  }

  return (
    <TileTable
      columns={[t("type"), t("amount")]}
      data={byType
        .map((type) => ({
          id: type.type,
          name: type.type,
          amount: type.total * (type.type === TransactionType.INCOME ? 1 : -1),
          color: (type.type === TransactionType.INCOME
            ? "success"
            : type.type === TransactionType.EXPENSE
            ? "danger"
            : "warning") as Color,
        }))
        .sort((a, b) => b.amount - a.amount)}
    />
  );
};
