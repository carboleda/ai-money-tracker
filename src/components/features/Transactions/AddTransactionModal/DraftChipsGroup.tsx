"use client";

import React from "react";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { InlineAmountChip } from "./chips/InlineAmountChip";
import { InlineTypeChip } from "./chips/InlineTypeChip";
import { InlineCategoryChip } from "./chips/InlineCategoryChip";
import { InlineAccountChip } from "./chips/InlineAccountChip";
import { InlineDateTimeChip } from "./chips/InlineDateTimeChip";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";

export interface DraftChipsGroupProps {
  onInteraction: () => void;
}

/**
 * Renders the row of interactive badged chips for the AI draft, adapting
 * the layout to the active TransactionType (Category hidden for Transfer,
 * Destination Account shown only for Transfer).
 * See sdd/ai-draft-transaction-pipeline.md §2.4 / §4.1 (<DraftChipsGroup>).
 */
export const DraftChipsGroup: React.FC<DraftChipsGroupProps> = ({
  onInteraction,
}) => {
  const {
    amount,
    type,
    categoryRef,
    sourceAccountRef,
    destinationAccountRef,
    createdAt,
    updateDraftField,
  } = useTransactionDraftStore();

  const isTransfer = type === TransactionType.TRANSFER;

  return (
    <div className="flex flex-wrap gap-2">
      <InlineAmountChip
        amount={amount}
        type={type}
        onAmountChange={(value) => updateDraftField("amount", value)}
        onInteraction={onInteraction}
      />
      <InlineTypeChip
        type={type}
        onTypeChange={(value) => updateDraftField("type", value)}
        onInteraction={onInteraction}
      />
      {!isTransfer && (
        <InlineCategoryChip
          categoryRef={categoryRef}
          type={type}
          onCategoryChange={(value) => updateDraftField("categoryRef", value)}
          onInteraction={onInteraction}
        />
      )}
      <InlineAccountChip
        role="source"
        accountRef={sourceAccountRef}
        excludedAccountRef={isTransfer ? destinationAccountRef ?? undefined : undefined}
        isTransfer={isTransfer}
        onAccountChange={(value) => updateDraftField("sourceAccountRef", value)}
        onInteraction={onInteraction}
      />
      {isTransfer && (
        <InlineAccountChip
          role="destination"
          accountRef={destinationAccountRef ?? ""}
          excludedAccountRef={sourceAccountRef}
          onAccountChange={(value) =>
            updateDraftField("destinationAccountRef", value)
          }
          onInteraction={onInteraction}
        />
      )}
      <InlineDateTimeChip
        date={createdAt}
        onDateChange={(value) => updateDraftField("createdAt", value)}
        onInteraction={onInteraction}
      />
    </div>
  );
};
