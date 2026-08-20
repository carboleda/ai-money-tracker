"use client";

import { create } from "zustand";
import {
  TransactionType,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";

const AUTO_CONFIRM_SECONDS = 20;
const AUTO_CONFIRM_CONFIDENCE_THRESHOLD = 0.85;

export type DraftPipelineStatus =
  | "idle"
  | "parsing"
  | "drafted"
  | "saving"
  | "error";

export interface TransactionDraftState {
  // Modal Visibility
  isOpen: boolean;

  // Prompt & Multimodal inputs
  prompt: string;
  receiptImageBase64: string | null;
  receiptPreviewUrl: string | null;

  // Draft Data Fields (Reusing Domain Enums)
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  categoryRef: string;
  sourceAccountRef: string;
  destinationAccountRef: string | null;
  createdAt: Date; // Stores full Date and Time

  // Pipeline Status & Diagnostics
  pipelineStatus: DraftPipelineStatus;
  confidence: number;
  errorMessage: string | null;
  isAutoConfirmActive: boolean;
  autoConfirmCountdown: number; // 5 -> 0 seconds

  // Actions
  openDraftModal: (initialPrompt?: string) => void;
  closeDraftModal: () => void;
  setPrompt: (prompt: string) => void;
  setDescription: (description: string) => void;
  setReceiptImage: (base64: string | null, previewUrl: string | null) => void;
  updateDraftField: <K extends keyof TransactionDraftState>(
    key: K,
    value: TransactionDraftState[K],
  ) => void;
  setParsedDraft: (
    draft: Partial<TransactionDraftState>,
    confidence: number,
  ) => void;
  setErrorMessage: (msg: string | null) => void;
  startAutoConfirm: () => void;
  cancelAutoConfirm: () => void;
  resetDraft: () => void;
}

type DraftDataFields = Pick<
  TransactionDraftState,
  | "prompt"
  | "receiptImageBase64"
  | "receiptPreviewUrl"
  | "description"
  | "amount"
  | "type"
  | "status"
  | "categoryRef"
  | "sourceAccountRef"
  | "destinationAccountRef"
  | "createdAt"
  | "pipelineStatus"
  | "confidence"
  | "errorMessage"
  | "isAutoConfirmActive"
  | "autoConfirmCountdown"
>;

const createInitialDraftFields = (): DraftDataFields => ({
  prompt: "",
  receiptImageBase64: null,
  receiptPreviewUrl: null,
  description: "",
  amount: 0,
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  categoryRef: "",
  sourceAccountRef: "",
  destinationAccountRef: null,
  createdAt: new Date(),
  pipelineStatus: "idle",
  confidence: 0,
  errorMessage: null,
  isAutoConfirmActive: false,
  autoConfirmCountdown: AUTO_CONFIRM_SECONDS,
});

export const useTransactionDraftStore = create<TransactionDraftState>()(
  (set) => ({
    isOpen: false,
    ...createInitialDraftFields(),

    openDraftModal: (initialPrompt = "") =>
      set({
        ...createInitialDraftFields(),
        isOpen: true,
        prompt: initialPrompt,
      }),

    closeDraftModal: () => set({ isOpen: false }),

    setPrompt: (prompt) => set({ prompt }),

    setDescription: (description) => set({ description }),

    setReceiptImage: (base64, previewUrl) =>
      set({ receiptImageBase64: base64, receiptPreviewUrl: previewUrl }),

    updateDraftField: (key, value) =>
      set({ [key]: value } as Pick<TransactionDraftState, typeof key>),

    setParsedDraft: (draft, confidence) =>
      set({
        ...draft,
        confidence,
        pipelineStatus: "drafted",
        errorMessage: null,
      }),

    setErrorMessage: (msg) =>
      set({ errorMessage: msg, pipelineStatus: msg ? "error" : "idle" }),

    startAutoConfirm: () =>
      set({
        isAutoConfirmActive: true,
        autoConfirmCountdown: AUTO_CONFIRM_SECONDS,
      }),

    cancelAutoConfirm: () =>
      set({
        isAutoConfirmActive: false,
        autoConfirmCountdown: AUTO_CONFIRM_SECONDS,
      }),

    resetDraft: () => set({ ...createInitialDraftFields() }),
  }),
);

export { AUTO_CONFIRM_SECONDS, AUTO_CONFIRM_CONFIDENCE_THRESHOLD };
