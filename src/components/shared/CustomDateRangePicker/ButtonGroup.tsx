"use client";

import {
  DateRangePicker,
  DateRangePickerProps,
  RangeCalendar,
  ToggleButtonGroup,
  ToggleButton,
  Label,
} from "@heroui/react";
import { toggleButtonVariants } from "@heroui/styles";
import { RangeValue } from "@react-types/shared";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { useCallback } from "react";
import { Group } from "react-aria-components";
import { getMonthBounds } from "@/config/utils";
import { useTranslation } from "react-i18next";

export enum RangeList {
  this = "this",
  last = "last",
  two = "two",
  quarter = "quarter",
  custom = "custom",
}

export interface CustomDateRangePickerProps extends Omit<
  DateRangePickerProps<ZonedDateTime>,
  "value" | "onChange"
> {
  value: RangeValue<ZonedDateTime>;
  label?: string;
  showLabel?: boolean;
  onChange: (value: RangeValue<ZonedDateTime>) => void;
  selectedKey: RangeList;
  onSelectedKeyChange: (key: RangeList) => void;
}

const currentMonthBounds = getMonthBounds(new Date());

const getBoundsForKey = (key: RangeList): { start: Date; end: Date } => {
  if (key === RangeList.last) {
    return getMonthBounds(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );
  }
  if (key === RangeList.two) {
    return getMonthBounds(
      new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    );
  }
  if (key === RangeList.quarter) {
    const quarterBounds = getMonthBounds(
      new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    );
    return { start: quarterBounds.start, end: currentMonthBounds.end };
  }

  return currentMonthBounds;
};

const presetEntries = Object.entries(RangeList).filter(
  ([, value]) => value !== RangeList.custom,
);

const rangeLabelFormatOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

const formatRangeLabel = (value: RangeValue<ZonedDateTime>) =>
  `${value.start.toDate().toLocaleDateString(undefined, rangeLabelFormatOptions)} – ${value.end
    .toDate()
    .toLocaleDateString(undefined, rangeLabelFormatOptions)}`;

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  label,
  showLabel = false,
  selectedKey,
  onSelectedKeyChange,
  ...props
}) => {
  const { t } = useTranslation();

  const onDateChange = useCallback(
    (value: RangeValue<ZonedDateTime> | null) => {
      props.onChange(value!);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onChange],
  );

  const onPresetChange = useCallback(
    (key: RangeList) => {
      onSelectedKeyChange(key);
      if (key === RangeList.custom) return;

      const bounds = getBoundsForKey(key);
      onDateChange({
        start: parseAbsoluteToLocal(bounds.start.toISOString()),
        end: parseAbsoluteToLocal(bounds.end.toISOString()),
      });
    },
    [onSelectedKeyChange, onDateChange],
  );

  const isCustomSelected = selectedKey === RangeList.custom;
  const customLabel =
    isCustomSelected && props.value
      ? formatRangeLabel(props.value)
      : t(RangeList.custom);

  return (
    <div className="flex flex-col gap-1">
      {showLabel && label ? <Label>{label}</Label> : null}
      <div className="flex items-center gap-1">
        <ToggleButtonGroup
          isDetached
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={isCustomSelected ? [] : [selectedKey]}
          onSelectionChange={(keys) =>
            onPresetChange([...keys][0] as RangeList)
          }
        >
          {presetEntries.map(([key, value]) => (
            <ToggleButton key={key} id={value}>
              {t(value)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <DateRangePicker {...props} onChange={onDateChange}>
          <Group className="inline-flex">
            <DateRangePicker.Trigger
              className={`${toggleButtonVariants({})} w-fit! rounded-3xl! px-4! py-0!`}
              data-selected={isCustomSelected ? "true" : undefined}
              onPress={() => onPresetChange(RangeList.custom)}
            >
              {customLabel}
            </DateRangePicker.Trigger>
          </Group>
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
    </div>
  );
};
