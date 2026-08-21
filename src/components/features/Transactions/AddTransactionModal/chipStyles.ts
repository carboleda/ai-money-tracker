/**
 * Shared style tokens for the AI Draft badged chips.
 * See sdd/ai-draft-transaction-pipeline.md §2.1 (Visual Styling & Theme Tokens).
 */
export const CHIP_BASE_CLASS =
  "bg-default hover:bg-default/80 border border-border text-default-foreground rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none inline-flex items-center gap-1 h-auto min-h-0 justify-start";

export const CHIP_ACTIVE_CLASS = "border-accent ring-1 ring-accent/50 bg-surface";

export const CHIP_EXPENSE_AMOUNT_CLASS = "text-danger font-semibold";
export const CHIP_INCOME_AMOUNT_CLASS = "text-success font-semibold";
export const CHIP_TRANSFER_AMOUNT_CLASS = "text-warning font-semibold";
