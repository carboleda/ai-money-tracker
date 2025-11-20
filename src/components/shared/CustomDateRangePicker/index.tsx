"use client";

import { DateRangePicker, DateRangePickerProps } from "@heroui/date-picker";
import { Button } from "@heroui/button";
import { RangeValue } from "@react-types/shared";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMonthBounds } from "@/config/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { HiArrowCircleLeft } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { cn } from "@heroui/theme";

enum RangeList {
  this = "this",
  last = "last",
  two = "two",
  quarter = "quarter",
  custom = "custom",
}

export interface CustomDateRangePickerProps
  extends Omit<DateRangePickerProps<ZonedDateTime>, "value" | "onChange"> {
  value: RangeValue<ZonedDateTime>;
  showLabel?: boolean;
  onChange: (value: RangeValue<ZonedDateTime>) => void;
}

const currentMonthBounds = getMonthBounds(new Date());

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  label,
  showLabel = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<RangeList>(RangeList.this);

  const selectedValue = useMemo(() => t(selectedKey), [selectedKey, t]);

  const onDateChange = useCallback(
    (value: RangeValue<ZonedDateTime> | null) => {
      props.onChange(value!); // FIXME: remove the ! operator
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onChange]
  );

  useEffect(() => {
    let bounds: { start: Date; end: Date };
    if (selectedKey === RangeList.last) {
      bounds = getMonthBounds(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      );
    } else if (selectedKey === RangeList.two) {
      bounds = getMonthBounds(
        new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)
      );
    } else if (selectedKey === RangeList.quarter) {
      const querterBounds = getMonthBounds(
        new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1)
      );
      bounds = {
        start: querterBounds.start,
        end: currentMonthBounds.end,
      };
    } else {
      bounds = currentMonthBounds;
    }

    onDateChange({
      start: parseAbsoluteToLocal(bounds.start.toISOString()),
      end: parseAbsoluteToLocal(bounds.end.toISOString()),
    });
  }, [onDateChange, selectedKey]);

  if (selectedKey === RangeList.custom) {
    return (
      <DateRangePicker
        {...props}
        label={showLabel ? label : undefined}
        onChange={onDateChange}
        startContent={
          <Button
            className="min-w-0 min-h-0 w-fit h-fit"
            variant="light"
            color="default"
            radius="full"
            onPress={() => setSelectedKey(RangeList.this)}
            isIconOnly
          >
            <HiArrowCircleLeft
              className="text-5xl p-0 m-0 min-h-0 h-fit"
              color="gray"
            />
          </Button>
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
          className={cn("justify-start px-3 rounded-xl", {
            "py-6": showLabel,
          })}
        >
          {showLabel ? (
            <div className="text-start">
              <label className="text-xs text-default-600">
                {label}{" "}
                {props.isRequired && <span className="text-red-600">*</span>}
              </label>
              <div className="text-default-800">{selectedValue}</div>
            </div>
          ) : (
            selectedValue || label
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("dateRangeFilter")}
        variant="flat"
        closeOnSelect={true}
        selectionMode="single"
        selectedKeys={selectedKey}
        onSelectionChange={(keys) =>
          setSelectedKey((keys.currentKey as RangeList)!)
        }
      >
        {Object.entries(RangeList).map(([key, value]) => (
          <DropdownItem key={key}>{t(value)}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
