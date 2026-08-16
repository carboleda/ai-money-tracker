"use client";

import React from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";

export interface CategoriesAutocompleteProps {
  label: string;
  isRequired?: boolean;
  className?: string;
  value: CategoryModel["ref"] | undefined;
  onChange: (ref: CategoryModel["ref"]) => void;
}

export const CategoriesAutocomplete: React.FC<CategoriesAutocompleteProps> = ({
  label,
  isRequired = false,
  className,
  value,
  onChange,
}) => {
  const { categories } = useCategoryStore();

  return (
    <Autocomplete
      label={label}
      variant="bordered"
      isRequired={isRequired}
      className={className}
      selectedKey={value ?? null}
      onSelectionChange={(v) => onChange(v as CategoryModel["ref"])}
    >
      {categories.map((category) => (
        <AutocompleteItem key={category.ref}>
          {`${category.icon} ${category.name}`}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
};
