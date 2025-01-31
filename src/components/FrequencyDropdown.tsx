import React, { use, useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Frequency, frequencyOptions } from "@/interfaces/recurringExpense";

interface FrequencyDropdownProps {
  selectedFrequency?: Frequency;
  onChange: (frequency: Frequency) => void;
}

export const FrequencyDropdown: React.FC<FrequencyDropdownProps> = ({
  selectedFrequency,
  onChange,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set<Frequency>([]));

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => frequencyOptions[key] ?? "")
        .join(", "),
    [selectedKeys]
  );

  useEffect(() => {
    if (selectedFrequency) {
      setSelectedKeys(new Set([selectedFrequency]));
    }
  }, [selectedFrequency]);

  const onSelectionChange = (keys: any) => {
    setSelectedKeys(keys);
    onChange([...keys.keys()][0] || "");
  };

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button
          variant="bordered"
          className="h-14 w-full"
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
        {/* {frequencyLabels.map((label, index) => {
          return (
            <DropdownItem key={frequencyKeys[index]}>{label}</DropdownItem>
          );
        })} */}
        {Object.entries(frequencyOptions).map(([key, label]) => {
          return <DropdownItem key={key}>{label}</DropdownItem>;
        })}
      </DropdownMenu>
    </Dropdown>
  );
};
