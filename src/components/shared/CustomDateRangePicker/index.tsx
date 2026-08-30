"use client";

import {
  DateRangePicker,
  DateRangePickerProps,
  DateField,
  RangeCalendar,
  Button,
  Label,
} from "@heroui/react";
import { RangeValue } from "@react-types/shared";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { useCallback, useEffect, useState } from "react";
import { getMonthBounds } from "@/config/utils";
import { HiArrowCircleLeft } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { CustomDropdown } from "../CustomDropdown";

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
  label?: string;
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
      <div className="flex items-center gap-1">
        <Button
          className="min-w-0 min-h-0 w-fit h-fit"
          variant="ghost"
          onPress={() => setSelectedKey(RangeList.this)}
          isIconOnly
        >
          <HiArrowCircleLeft
            className="text-5xl p-0 m-0 min-h-0 h-fit"
            color="gray"
          />
        </Button>
        <DateRangePicker {...props} onChange={onDateChange}>
          {showLabel && label ? <Label>{label}</Label> : null}
          <DateField.Group variant="secondary">
            <DateField.InputContainer>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.InputContainer>
            <DateField.Suffix>
              <DateRangePicker.Trigger>
                <DateRangePicker.TriggerIndicator />
              </DateRangePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DateRangePicker.Popover>
            <RangeCalendar>
              <RangeCalendar.Header>
                <RangeCalendar.NavButton slot="previous" />
                <RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.YearPickerTriggerHeading />
                  <RangeCalendar.YearPickerTriggerIndicator />
                </RangeCalendar.YearPickerTrigger>
                <RangeCalendar.NavButton slot="next" />
              </RangeCalendar.Header>
              <RangeCalendar.Grid>
                <RangeCalendar.GridHeader>
                  {(day) => (
                    <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                  )}
                </RangeCalendar.GridHeader>
                <RangeCalendar.GridBody>
                  {(date) => <RangeCalendar.Cell date={date} />}
                </RangeCalendar.GridBody>
              </RangeCalendar.Grid>
            </RangeCalendar>
          </DateRangePicker.Popover>
        </DateRangePicker>
      </div>
    );
  }

  return (
    <CustomDropdown
      values={Object.entries(RangeList).map(([key, value]) => ({
        key,
        label: t(value),
      }))}
      label={label}
      value={selectedKey}
      isRequired={props.isRequired}
      showLabel={showLabel}
      onChange={(key: unknown) => setSelectedKey((key as RangeList)!)}
    />
  );
};
