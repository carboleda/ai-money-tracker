import React, { useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import {
  Frequency,
  frequencyKeys,
  frequencyLabels,
} from "@/interfaces/recurringExpense";

interface FrequencyDropdownProps {
  selectedFrequency?: Frequency;
  onChange: (frequency: Frequency) => void;
}

export const FrequencyDropdown: React.FC<FrequencyDropdownProps> = ({
  selectedFrequency,
  onChange,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(
    new Set<Frequency>(selectedFrequency ? [selectedFrequency] : [])
  );

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map(
          (key) =>
            frequencyLabels[frequencyKeys.findIndex((k) => k === key)] ||
            "Frequency"
        )
        .join(", "),
    [selectedKeys]
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
          className="h-14"
          style={{ justifyContent: "flex-start" }}
        >
          <div className="text-start mh-5">
            <label className="text-xs text-default-600">Frequency</label>
            <div>{selectedValue}</div>
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Frequency"
        variant="flat"
        closeOnSelect={true}
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
      >
        {frequencyLabels.map((label, index) => {
          return (
            <DropdownItem key={frequencyKeys[index]}>{label}</DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};
