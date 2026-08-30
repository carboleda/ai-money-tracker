"use client";
import React from "react";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import { frequencyOptions } from "@/interfaces/recurringExpense";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

interface FrequencyDropdownProps {
  selectedFrequency?: Frequency;
  onChange: (frequency: Frequency) => void;
}

export const FrequencyDropdown: React.FC<FrequencyDropdownProps> = ({
  selectedFrequency,
  onChange,
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const values = Object.keys(frequencyOptions).map((key) => ({
    key,
    label: t(key),
  }));

  return (
    <CustomDropdown
      values={values}
      label={t("frequency")}
      value={selectedFrequency}
      showLabel
      onChange={(key) => onChange(key as Frequency)}
    />
  );
};
