import React from "react";
import { Calendar, DateField, DatePicker, Label } from "@heroui/react";
import { ZonedDateTime } from "@internationalized/date";
import { TransactionInput } from "@/components/TransactionInput";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

interface FreeTextModeProps {
  setText: (text: string) => void;
  createdAt?: ZonedDateTime;
  setCreatedAt: (createdAt: ZonedDateTime) => void;
}

export const FreeTextMode: React.FC<FreeTextModeProps> = ({
  setText,
  createdAt,
  setCreatedAt,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  return (
    <>
      <TransactionInput onChanged={setText} createOnSubmit={false} isRequired />
      <DatePicker
        granularity="minute"
        value={createdAt ?? null}
        onChange={(v) => setCreatedAt(v as ZonedDateTime)}
        hideTimeZone
      >
        <Label>{t("transactionDate")}</Label>
        <DateField.Group fullWidth>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label={t("transactionDate")}>
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(date) => <Calendar.Cell date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </>
  );
};
