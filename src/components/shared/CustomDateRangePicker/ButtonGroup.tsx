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
  sevenDays = "sevenDays",
  currentMonth = "currentMonth",
  prevMonth = "prevMonth",
  twoMonths = "twoMonths",
  threeMonths = "threeMonths",
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

const getRollingBounds = (
  amount: number,
  unit: "days" | "months",
): { start: Date; end: Date } => {
  const start = new Date();
  if (unit === "days") start.setDate(start.getDate() - amount);
  else start.setMonth(start.getMonth() - amount);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getBoundsForKey = (key: RangeList): { start: Date; end: Date } => {
  if (key === RangeList.sevenDays) return getRollingBounds(7, "days");
  if (key === RangeList.prevMonth) {
    return getMonthBounds(
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    );
  }
  if (key === RangeList.twoMonths) return getRollingBounds(2, "months");
  if (key === RangeList.threeMonths) return getRollingBounds(3, "months");

  return currentMonthBounds;
};

const monthShortLabelFormatOptions: Intl.DateTimeFormatOptions = {
  month: "short",
};

const getPresetLabel = (key: RangeList, t: (key: string) => string) => {
  if (key === RangeList.prevMonth) {
    return new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    ).toLocaleDateString(undefined, monthShortLabelFormatOptions);
  }
  if (key === RangeList.currentMonth) {
    return new Date().toLocaleDateString(
      undefined,
      monthShortLabelFormatOptions,
    );
  }

  return t(key);
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
              {getPresetLabel(value as RangeList, t)}
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
