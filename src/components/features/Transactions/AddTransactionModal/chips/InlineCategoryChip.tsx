"use client";

import React, { useMemo } from "react";
import { Button, Dropdown, Label } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { CategoryType } from "@/app/api/domain/category/model/category.model";
import { CHIP_BASE_CLASS } from "../chipStyles";

export interface InlineCategoryChipProps {
  categoryRef: string;
  /**
   * Deviation from the SDD's literal prop list (§4.2 #4): the active
   * TransactionType is required to filter the category dropdown to
   * categories matching the current type (CategoryType mirrors
   * TransactionType values), since categories are shared across the whole
   * app rather than pre-filtered by the caller.
   */
  type: TransactionType;
  onCategoryChange: (categoryRef: string) => void;
  onInteraction: () => void;
}

/**
 * Compact inline dropdown for the AI-drafted category.
 * See sdd/ai-draft-transaction-pipeline.md §2.4 (Category row) / §4.2 (#4).
 */
export const InlineCategoryChip: React.FC<InlineCategoryChipProps> = ({
  categoryRef,
  type,
  onCategoryChange,
  onInteraction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { categories } = useCategoryStore();

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === (type as unknown as CategoryType)
      ),
    [categories, type]
  );

  const selectedCategory = categories.find((c) => c.ref === categoryRef);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) onInteraction();
  };

  const onSelectionChange = (keys: any) => {
    const selected = [...keys.keys()][0] as string | undefined;
    if (selected) onCategoryChange(selected);
  };

  return (
    <Dropdown onOpenChange={onOpenChange}>
      <Button variant="ghost" className={CHIP_BASE_CLASS}>
        {selectedCategory
          ? `${selectedCategory.icon} ${selectedCategory.name}`
          : `🛒 ${t("aiDraft.category.select")}`}{" "}
        ▾
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label={t("aiDraft.category.label")}
          selectionMode="single"
          selectedKeys={categoryRef ? new Set([categoryRef]) : new Set()}
          onSelectionChange={onSelectionChange}
        >
          {filteredCategories.map((category) => (
            <Dropdown.Item
              key={category.ref}
              id={category.ref}
              textValue={category.name}
            >
              <Label>
                {category.icon} {category.name}
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
