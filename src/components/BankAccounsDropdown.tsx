import React, { useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { getAccountList, getAccountName } from "@/config/utils";

interface BankAccounDropdownProps {
  label?: string;
  value?: string;
  isRequired?: boolean;
  skipDisabled?: boolean;
  onChange: (accountKey: string) => void;
}

export const BankAccounDropdown: React.FC<BankAccounDropdownProps> = ({
  label = "Bank Account",
  value,
  isRequired = false,
  skipDisabled = false,
  onChange,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>([]));

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => getAccountName(key) ?? "")
        .join(", "),
    [selectedKeys]
  );

  useEffect(() => {
    if (value) {
      setSelectedKeys(new Set([value]));
    }
  }, [value]);

  const onSelectionChange = (keys: any) => {
    setSelectedKeys(keys);
    onChange([...keys.keys()][0] || "");
  };

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button
          variant="bordered"
          size="md"
          className="h-14 w-full justify-start py-6 px-3 rounded-xl"
        >
          <div className="text-start mh-5">
            <label className="text-xs text-default-600">
              {label} {isRequired && <span className="text-red-600">*</span>}
            </label>
            <div>{selectedValue}</div>
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={label}
        variant="flat"
        closeOnSelect={true}
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
      >
        {getAccountList(skipDisabled).map(({ key, label }) => (
          <DropdownItem key={key}>{label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
