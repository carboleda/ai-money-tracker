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
  onChange: (accountKey: string) => void;
}

export const BankAccounDropdown: React.FC<BankAccounDropdownProps> = ({
  accounts = {},
  onChange,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>([]));

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => accounts[key] ?? "No filter")
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
        <Button variant="bordered">
          Bank Accounts: {selectedValue || "No filter"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Bank accounts"
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
