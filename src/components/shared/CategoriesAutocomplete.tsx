"use client";

import React from "react";
import { ComboBox, Input, Label, ListBox } from "@heroui/react";
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
    <ComboBox
      isRequired={isRequired}
      className={className}
      fullWidth
      variant="secondary"
      selectedKey={value ?? null}
      onSelectionChange={(key) => onChange(key as CategoryModel["ref"])}
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input fullWidth />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {categories.map((category) => (
            <ListBox.Item
              key={category.ref}
              id={category.ref}
              textValue={`${category.icon} ${category.name}`}
            >
              {`${category.icon} ${category.name}`}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
};
