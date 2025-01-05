import React from "react";
import { DatePicker } from "@nextui-org/date-picker";
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
        label={t("transactionDate")}
        variant="bordered"
        granularity="minute"
        value={createdAt}
        onChange={(v) => setCreatedAt(v!)}
        hideTimeZone
      />
    </>
  );
};
