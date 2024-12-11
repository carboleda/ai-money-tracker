import { DateRangePicker, DateRangePickerProps } from "@nextui-org/date-picker";
import { Button } from "@nextui-org/button";
import { RangeValue } from "@react-types/shared";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMonthBounds } from "@/config/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { HiArrowCircleLeft } from "react-icons/hi";

enum RangeList {
  this = "This month",
  last = "Last month",
  three = "Three months",
  custom = "Custom range",
}

export interface CustomDateRangePickerProps
  extends Omit<DateRangePickerProps<ZonedDateTime>, "value" | "onChange"> {
  value: RangeValue<ZonedDateTime>;
  onChange: (value: RangeValue<ZonedDateTime>) => void;
}

const mapSelectedKeyToValue = Object.fromEntries(Object.entries(RangeList));
const currentMonthBounds = getMonthBounds(new Date());

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  ...props
}) => {
  const [selectedKey, setSelectedKey] = useState<RangeList>(
    "this" as RangeList
  );

  const selectedValue = useMemo(
    () => mapSelectedKeyToValue[selectedKey],
    [selectedKey]
  );
  // const [dateWithin, setDateWithin] = useState<RangeValue<ZonedDateTime>>({
  //   start: parseAbsoluteToLocal(currentMonthBounds.start.toISOString()),
  //   end: parseAbsoluteToLocal(currentMonthBounds.end.toISOString()),
  // });

  const onDateChange = useCallback(
    (value: RangeValue<ZonedDateTime>) => {
      // setDateWithin(value);
      props.onChange(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onChange]
  );

  useEffect(() => {
    let bounds: { start: Date; end: Date };
    if (selectedKey === ("last" as RangeList)) {
      bounds = getMonthBounds(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      );
    } else if (selectedKey === ("three" as RangeList)) {
      bounds = getMonthBounds(
        new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)
      );
    } else {
      bounds = currentMonthBounds;
    }

    onDateChange({
      start: parseAbsoluteToLocal(bounds.start.toISOString()),
      end: parseAbsoluteToLocal(bounds.end.toISOString()),
    });
  }, [onDateChange, selectedKey]);

  if (selectedKey === ("custom" as RangeList)) {
    return (
      <DateRangePicker
        {...props}
        onChange={onDateChange}
        startContent={
          <HiArrowCircleLeft
            className="text-5xl"
            onClick={() => setSelectedKey("this" as RangeList)}
          />
        }
      />
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          size="md"
          className="h-14 w-full justify-start py-6 px-3 rounded-xl"
        >
          <div className="text-start mh-5">
            <label className="text-xs text-default-600">
              Date within{" "}
              {props.isRequired && <span className="text-red-600">*</span>}
            </label>
            <div>{selectedValue}</div>
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Date range"
        variant="flat"
        closeOnSelect={true}
        selectionMode="single"
        selectedKeys={selectedKey}
        onSelectionChange={(keys) =>
          setSelectedKey((keys.currentKey as RangeList)!)
        }
      >
        {Object.entries(RangeList).map(([key, value]) => (
          <DropdownItem key={key}>{value}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
