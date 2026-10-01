"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { Frequency, frequencyOptions } from "@/interfaces/recurringExpense";
import { useCategoryStore } from "@/stores/useCategoryStore";
import {
  InlineCategoryChip,
  InlineAmountChip,
  InlineSelectChip,
  InlineSelectOption,
  InlineDueDateChip,
  InlineTextChip,
} from "@/components/shared/InlineChips";

export interface RecurringExpenseChipsGroupProps {
  categoryRef?: CategoryModel["ref"];
  onCategoryChange: (categoryRef: string) => void;
  amount?: number;
  onAmountChange: (amount: number) => void;
  frequency: Frequency;
  onFrequencyChange: (frequency: Frequency) => void;
  dueDate?: Date;
  onDueDateChange: (date: Date) => void;
  paymentLink?: string;
  onPaymentLinkChange: (paymentLink: string) => void;
  notes?: string;
  onNotesChange: (notes: string) => void;
}

export const RecurringExpenseChipsGroup: React.FC<
  RecurringExpenseChipsGroupProps
> = ({
  categoryRef,
  onCategoryChange,
  amount,
  onAmountChange,
  frequency,
  onFrequencyChange,
  dueDate,
  onDueDateChange,
  paymentLink,
  onPaymentLinkChange,
  notes,
  onNotesChange,
}) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { t: tCommon } = useTranslation(LocaleNamespace.Common);
  const { t: tTransactions } = useTranslation(LocaleNamespace.Transactions);
  const { categories } = useCategoryStore();

  const frequencyOptionsList: InlineSelectOption<Frequency>[] = Object.keys(
    frequencyOptions,
  ).map((key) => ({
    id: key as Frequency,
    label: tCommon(key),
  }));

  return (
    <div className="flex flex-wrap gap-2">
      <InlineCategoryChip
        categoryRef={categoryRef}
        categories={categories}
        placeholder={tTransactions("aiDraft.category.select")}
        searchPlaceholder={tTransactions("aiDraft.category.search")}
        ariaLabel={t("category")}
        isRequired
        onCategoryChange={onCategoryChange}
      />
      <InlineAmountChip
        amount={amount}
        isRequired
        onAmountChange={onAmountChange}
      />
      <InlineSelectChip
        value={frequency}
        options={frequencyOptionsList}
        onChange={onFrequencyChange}
        ariaLabel={tCommon("frequency")}
      />
      <InlineDueDateChip
        frequency={frequency}
        date={dueDate}
        onDateChange={onDueDateChange}
        isRequired
        placeholder={tCommon("dueDate")}
        dayLabel={tCommon("day")}
        monthLabel={tCommon("month")}
        doneLabel={tCommon("confirm")}
      />
      <InlineTextChip
        value={paymentLink ?? ""}
        onChange={onPaymentLinkChange}
        placeholder={t("paymentLink")}
        icon="🔗"
      />
      <InlineTextChip
        value={notes ?? ""}
        onChange={onNotesChange}
        placeholder={t("notesPlaceholder")}
        icon="💬"
        multiline
      />
    </div>
  );
};
