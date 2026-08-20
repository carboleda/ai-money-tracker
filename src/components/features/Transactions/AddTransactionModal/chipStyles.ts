/**
 * Shared style tokens for the AI Draft badged chips.
 * See sdd/ai-draft-transaction-pipeline.md §2.1 (Visual Styling & Theme Tokens).
 */
export const CHIP_BASE_CLASS =
  "bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none inline-flex items-center gap-1 h-auto min-h-0 justify-start";

export const CHIP_ACTIVE_CLASS =
  "border-lime-500 ring-1 ring-lime-500/50 bg-zinc-900";

export const CHIP_EXPENSE_AMOUNT_CLASS = "text-rose-400 font-semibold";
export const CHIP_INCOME_AMOUNT_CLASS = "text-emerald-400 font-semibold";
export const CHIP_TRANSFER_AMOUNT_CLASS = "text-cyan-400 font-semibold";
