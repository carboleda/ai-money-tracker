"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import {
  CategoryType,
  categoryAppliesToType,
} from "@/app/api/domain/category/model/category.model";
import { useAccountStore } from "@/stores/useAccountStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import {
  InlineAmountChip,
  InlineSelectChip,
  InlineSelectOption,
  InlineCategoryChip,
  InlineAccountChip,
  InlineDateTimeChip,
} from "@/components/shared/InlineChips";

export interface TransactionEditChipsGroupProps {
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  amount?: number;
  onAmountChange: (amount: number) => void;
  sourceAccountRef: string;
  onSourceAccountChange: (accountRef: string) => void;
  destinationAccountRef: string;
  onDestinationAccountChange: (accountRef: string) => void;
  categoryRef?: string;
  onCategoryChange: (categoryRef: string) => void;
  createdAt?: Date;
  onCreatedAtChange: (date: Date) => void;
}

export const TransactionEditChipsGroup: React.FC<
  TransactionEditChipsGroupProps
> = ({
  type,
  onTypeChange,
  amount,
  onAmountChange,
  sourceAccountRef,
  onSourceAccountChange,
  destinationAccountRef,
  onDestinationAccountChange,
  categoryRef,
  onCategoryChange,
  createdAt,
  onCreatedAtChange,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();

  const isTransfer = type === TransactionType.TRANSFER;

  const typeOptions: InlineSelectOption<TransactionType>[] = [
    {
      id: TransactionType.EXPENSE,
      label: t("aiDraft.type.expense"),
      icon: "🏷️",
    },
    { id: TransactionType.INCOME, label: t("aiDraft.type.income"), icon: "🏷️" },
    {
      id: TransactionType.TRANSFER,
      label: t("aiDraft.type.transfer"),
      icon: "🏷️",
    },
  ];

  const sourceFilterFn = (account: (typeof accounts)[number]) =>
    isTransfer ? account.ref !== destinationAccountRef : true;

  const destinationFilterFn = (account: (typeof accounts)[number]) =>
    account.ref !== sourceAccountRef;

  const categoryFilterFn = (category: (typeof categories)[number]) =>
    categoryAppliesToType(
      category.restrictedTypes,
      type as unknown as CategoryType,
    );

  return (
    <div className="flex flex-wrap gap-2">
      <InlineSelectChip
        value={type}
        options={typeOptions}
        onChange={onTypeChange}
        ariaLabel={t("aiDraft.type.label")}
      />
      <InlineAmountChip
        amount={amount}
        isRequired
        onAmountChange={onAmountChange}
      />
      <InlineAccountChip
        accountRef={sourceAccountRef}
        accounts={accounts}
        filterFn={sourceFilterFn}
        icon={isTransfer ? "📤" : "💳"}
        labelPrefix={isTransfer ? `${t("aiDraft.account.from")}: ` : ""}
        placeholder={t("aiDraft.account.select")}
        ariaLabel={t("sourceAccount")}
        isRequired
        onAccountChange={onSourceAccountChange}
      />
      {isTransfer && (
        <InlineAccountChip
          accountRef={destinationAccountRef}
          accounts={accounts}
          filterFn={destinationFilterFn}
          icon="📥"
          labelPrefix={`${t("aiDraft.account.to")}: `}
          placeholder={t("aiDraft.account.select")}
          ariaLabel={t("destinationAccount")}
          isRequired
          onAccountChange={onDestinationAccountChange}
        />
      )}
      {!isTransfer && (
        <InlineCategoryChip
          categoryRef={categoryRef}
          categories={categories}
          filterFn={categoryFilterFn}
          placeholder={`🛒 ${t("aiDraft.category.select")}`}
          searchPlaceholder={t("aiDraft.category.search")}
          ariaLabel={t("aiDraft.category.label")}
          onCategoryChange={onCategoryChange}
        />
      )}
      <InlineDateTimeChip
        date={createdAt ?? new Date()}
        onDateChange={onCreatedAtChange}
        isRequired
        todayLabel={t("aiDraft.dateTime.today")}
        yesterdayLabel={t("aiDraft.dateTime.yesterday")}
        customDateLabel={t("aiDraft.dateTime.customDate")}
        customTimeLabel={t("aiDraft.dateTime.time")}
      />
    </div>
  );
};
