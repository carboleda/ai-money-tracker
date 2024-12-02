import React from "react";
import { DatePicker } from "@nextui-org/date-picker";
import { ZonedDateTime } from "@internationalized/date";
import { TransactionInput } from "@/components/TransactionInput";

interface FreeTextModeProps {
  setText: (text: string) => void;
  setCreatedAtInput: (createdAt: ZonedDateTime) => void;
  createdAt?: ZonedDateTime;
  setCreatedAt: (createdAt: ZonedDateTime) => void;
}

export const FreeTextMode: React.FC<FreeTextModeProps> = ({
  setText,
  createdAt,
  setCreatedAt,
}) => {
  return (
    <>
      <TransactionInput onChanged={setText} createOnSubmit={false} isRequired />
      <DatePicker
        label="Transaction date"
        variant="bordered"
        granularity="minute"
        value={createdAt}
        onChange={(v) => setCreatedAt(v)}
      />
    </>
  );
};
