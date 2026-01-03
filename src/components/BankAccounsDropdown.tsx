"use client";

import React from "react";
import { CustomDropdown, CustomDropdownProps } from "./shared/CustomDropdown";
import { useAccountStore } from "@/stores/useAccountStore";

interface BankAccounDropdownProps extends Omit<CustomDropdownProps, "values"> {}

export const BankAccounDropdown: React.FC<BankAccounDropdownProps> = ({
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
