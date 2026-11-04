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
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import {
  InlineAmountChip,
  InlineSelectChip,
  InlineSelectOption,
  InlineCategoryChip,
  InlineAccountChip,
  InlineDateTimeChip,
} from "@/components/shared/InlineChips";
import { getAmountColorClass, getAmountSign } from "./transactionChipColors";

export interface DraftChipsGroupProps {
  onInteraction: () => void;
}

/**
 * Renders the row of interactive badged chips for the AI draft, adapting
 * the layout to the active TransactionType (Destination Account shown
 * only for Transfer).
 * See sdd/ai-draft-transaction-pipeline.md §2.4 / §4.1 (<DraftChipsGroup>).
 */
export const DraftChipsGroup: React.FC<DraftChipsGroupProps> = ({
  onInteraction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const {
    amount,
    type,
    categoryRef,
    sourceAccountRef,
    destinationAccountRef,
    createdAt,
    updateDraftField,
  } = useTransactionDraftStore();

  const isTransfer = type === TransactionType.TRANSFER;

  const typeOptions: InlineSelectOption<TransactionType>[] = [
    {
      id: TransactionType.EXPENSE,
      label: t("aiDraft.type.expense"),
      icon: "🏷️",
    },
    {
      id: TransactionType.INCOME,
      label: t("aiDraft.type.income"),
      icon: "🏷️",
    },
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
      <InlineAmountChip
        amount={amount}
        colorClassName={getAmountColorClass(type)}
        sign={getAmountSign(type)}
        onAmountChange={(value) => updateDraftField("amount", value)}
        onInteraction={onInteraction}
      />
      <InlineSelectChip
        value={type}
        options={typeOptions}
        onChange={(value) => updateDraftField("type", value)}
        ariaLabel={t("aiDraft.type.label")}
        onInteraction={onInteraction}
      />
      <InlineCategoryChip
        categoryRef={categoryRef}
        categories={categories}
        filterFn={categoryFilterFn}
        placeholder={`🛒 ${t("aiDraft.category.select")}`}
        searchPlaceholder={t("aiDraft.category.search")}
        ariaLabel={t("aiDraft.category.label")}
        onCategoryChange={(value) => updateDraftField("categoryRef", value)}
        onInteraction={onInteraction}
      />
      <InlineAccountChip
        accountRef={sourceAccountRef}
        accounts={accounts}
        filterFn={sourceFilterFn}
        icon={isTransfer ? "📤" : "💳"}
        labelPrefix={isTransfer ? `${t("aiDraft.account.from")}: ` : ""}
        placeholder={t("aiDraft.account.select")}
        ariaLabel={t("sourceAccount")}
        onAccountChange={(value) => updateDraftField("sourceAccountRef", value)}
        onInteraction={onInteraction}
      />
      {isTransfer && (
        <InlineAccountChip
          accountRef={destinationAccountRef ?? ""}
          accounts={accounts}
          filterFn={destinationFilterFn}
          icon="📥"
          labelPrefix={`${t("aiDraft.account.to")}: `}
          placeholder={t("aiDraft.account.select")}
          ariaLabel={t("destinationAccount")}
          onAccountChange={(value) =>
            updateDraftField("destinationAccountRef", value)
          }
          onInteraction={onInteraction}
        />
      )}
      <InlineDateTimeChip
        date={createdAt}
        onDateChange={(value) => updateDraftField("createdAt", value)}
        todayLabel={t("aiDraft.dateTime.today")}
        yesterdayLabel={t("aiDraft.dateTime.yesterday")}
        customDateLabel={t("aiDraft.dateTime.customDate")}
        customTimeLabel={t("aiDraft.dateTime.time")}
        onInteraction={onInteraction}
      />
    </div>
  );
};
