"use client";

import React, { useMemo, useRef } from "react";
import { Autocomplete, ListBox, SearchField, useFilter } from "@heroui/react";
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
  const { contains } = useFilter({ sensitivity: "base" });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === (type as unknown as CategoryType)
      ),
    [categories, type]
  );

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      onInteraction();
      // The Popover's own mount-focus logic (and the underlying Select's
      // listbox focus-on-open behavior) can steal focus back from the
      // search input after it mounts, so autoFocus alone isn't reliable
      // for keyboard-only opens. Deferring to the next frame guarantees
      // this call is the last one to run, after any internal focus shuffling.
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  };

  const onChange = (key: React.Key | null) => {
    if (key) onCategoryChange(key as string);
  };

  return (
    <Autocomplete
      value={categoryRef || null}
      onChange={onChange}
      onOpenChange={onOpenChange}
      placeholder={`🛒 ${t("aiDraft.category.select")}`}
      aria-label={t("aiDraft.category.label")}
    >
      <Autocomplete.Trigger className={CHIP_BASE_CLASS}>
        <Autocomplete.Value className="text-xs pr-0.5" />
        <Autocomplete.Indicator>
          <span aria-hidden="true" className="text-white!">
            ▾
          </span>
        </Autocomplete.Indicator>
      </Autocomplete.Trigger>
      <Autocomplete.Popover className="w-auto min-w-[200px] max-w-[300px]">
        <Autocomplete.Filter filter={contains}>
          <SearchField>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                ref={searchInputRef}
                placeholder={t("aiDraft.category.search")}
              />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            {filteredCategories.map((category) => (
              <ListBox.Item
                key={category.ref}
                id={category.ref}
                textValue={`${category.icon} ${category.name}`}
              >
                {category.icon} {category.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
};
