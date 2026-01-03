"use client";

import React from "react";
import { CustomDropdown, CustomDropdownProps } from "./shared/CustomDropdown";
import { useAccountStore } from "@/stores/useAccountStore";

export const BankAccounDropdown: React.FC<CustomDropdownProps> = ({
  label = "Bank Account",
  value,
  isRequired = false,
  showLabel = false,
  className,
  onChange,
}) => {
  const { accounts } = useAccountStore();

  return (
    <CustomDropdown
      values={accounts.map((account) => ({
        key: account.ref,
        label: account.name,
      }))}
      label={label}
      value={value}
      isRequired={isRequired}
      showLabel={showLabel}
      className={className}
      onChange={onChange}
    />
  );
};
