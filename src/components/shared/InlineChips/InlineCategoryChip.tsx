"use client";

import React, { useMemo, useRef } from "react";
import { Autocomplete, ListBox, SearchField, useFilter } from "@heroui/react";
import clsx from "clsx";
import { CHIP_BASE_CLASS, CHIP_REQUIRED_EMPTY_CLASS } from "./chipStyles";

export interface InlineCategoryOption {
  ref: string;
  name: string;
  icon: string;
}

export interface InlineCategoryChipProps<
  T extends InlineCategoryOption = InlineCategoryOption,
> {
  categoryRef?: string;
  categories: T[];
  filterFn?: (category: T) => boolean;
  placeholder: string;
  searchPlaceholder: string;
  ariaLabel: string;
  isRequired?: boolean;
  onCategoryChange: (categoryRef: string) => void;
  onInteraction?: () => void;
}

/**
 * Compact inline autocomplete for selecting a category.
 */
export function InlineCategoryChip<T extends InlineCategoryOption>({
  categoryRef,
  categories,
  filterFn = () => true,
  placeholder,
  searchPlaceholder,
  ariaLabel,
  isRequired = false,
  onCategoryChange,
  onInteraction = () => {},
}: InlineCategoryChipProps<T>) {
  const { contains } = useFilter({ sensitivity: "base" });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(
    () => categories.filter(filterFn),
    [categories, filterFn]
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
      placeholder={placeholder}
      aria-label={ariaLabel}
    >
      <Autocomplete.Trigger
        className={clsx(
          CHIP_BASE_CLASS,
          isRequired && !categoryRef && CHIP_REQUIRED_EMPTY_CLASS
        )}
      >
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
                placeholder={searchPlaceholder}
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
}
