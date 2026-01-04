"use client";

import React from "react";
import { Color, TileTable } from "@/components/features/Summary/TileTable";

import { Skeleton } from "@heroui/skeleton";
import { TypeSummary } from "@/interfaces/summary";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";

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

  const getColorByType = (transactionType: TransactionType): Color => {
    if (transactionType === TransactionType.INCOME) {
      return "success";
    }
    if (transactionType === TransactionType.EXPENSE) {
      return "danger";
    }
    return "warning";
  };

  return (
    <TileTable
      columns={[t("type"), t("amount")]}
      data={byType
        .map((type) => ({
          id: type.type,
          name: type.type,
          amount: type.total * (type.type === TransactionType.INCOME ? 1 : -1),
          color: getColorByType(type.type as TransactionType),
        }))
        .sort((a, b) => b.amount - a.amount)}
    />
  );
};
