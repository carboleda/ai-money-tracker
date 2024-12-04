import React, { useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";

interface BankAccounDropdownProps {
  accounts: { [key: string]: string } | undefined;
  label?: string;
  isRequired?: boolean;
  onChange: (accountKey: string) => void;
}

export const BankAccounDropdown: React.FC<BankAccounDropdownProps> = ({
  accounts = {},
  label = "Bank Account",
  isRequired = false,
  onChange,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>([]));

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => accounts[key] ?? "")
        .join(", "),
    [selectedKeys, accounts]
  );

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
        {Object.entries(accounts).map(([key, label]) => {
          return <DropdownItem key={key}>{label}</DropdownItem>;
        })}
      </DropdownMenu>
    </Dropdown>
  );
};
