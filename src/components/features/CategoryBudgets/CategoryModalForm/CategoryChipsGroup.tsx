"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { CategoryType } from "@/app/api/domain/category/model/category.model";
import {
  InlineAmountChip,
  InlineComboBoxChip,
  InlineEmojiChip,
  InlineMultiSelectChip,
  InlineSelectOption,
} from "@/components/shared/InlineChips";

const NO_THRESHOLD = "none";

export interface CategoryChipsGroupProps {
  icon: string;
  onIconChange: (icon: string) => void;
  restrictedTypes: CategoryType[];
  onRestrictedTypesChange: (types: CategoryType[]) => void;
  limit?: number;
  onLimitChange: (limit: number) => void;
  alertThreshold: string;
  onAlertThresholdChange: (alertThreshold: string) => void;
  showBudget?: boolean;
}

export const CategoryChipsGroup: React.FC<CategoryChipsGroupProps> = ({
  icon,
  onIconChange,
  restrictedTypes,
  onRestrictedTypesChange,
  limit,
  onLimitChange,
  alertThreshold,
  onAlertThresholdChange,
  showBudget = true,
}) => {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);

  const typeOptions: InlineSelectOption<CategoryType>[] = [
    { id: CategoryType.INCOME, label: t("typeIncome") },
    { id: CategoryType.EXPENSE, label: t("typeExpense") },
    { id: CategoryType.TRANSFER, label: t("typeTransfer") },
  ];

  const alertThresholdOptions: InlineSelectOption<string>[] = [
    { id: NO_THRESHOLD, label: t("noAlert") },
    { id: "50", label: "50%" },
    { id: "75", label: "75%" },
    { id: "90", label: "90%" },
    { id: "100", label: "100%" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <InlineEmojiChip
          icon={icon}
          ariaLabel={t("icon")}
          defaultIcon="❔"
          isRequired
          onIconChange={onIconChange}
        />
        <InlineMultiSelectChip
          values={restrictedTypes}
          options={typeOptions}
          onChange={onRestrictedTypesChange}
          ariaLabel={t("restrictedTypes")}
          placeholder={t("restrictedTypes")}
        />
      </div>
      {showBudget && (
        <>
          <div className="flex flex-col gap-2">{t("budget")}</div>
          <div className="flex flex-wrap gap-2">
            <InlineAmountChip amount={limit} onAmountChange={onLimitChange} />
            <InlineComboBoxChip
              value={alertThreshold}
              options={alertThresholdOptions}
              onChange={onAlertThresholdChange}
              ariaLabel={t("alertThreshold")}
              formatCustomValue={(v) => `${v}%`}
              isValidCustomInput={(text) =>
                /^\d*$/.test(text) && Number(text) <= 100
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export { NO_THRESHOLD };
