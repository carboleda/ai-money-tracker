"use client";

import { useMutation } from "@tanstack/react-query";
import { sendRequest } from "@/config/request";
import {
  ParseTransactionDraftRequest,
  ParseTransactionDraftResponse,
  ParseTransactionDraftErrorResponse,
} from "@/interfaces/transaction";
import {
  useTransactionDraftStore,
  AUTO_CONFIRM_CONFIDENCE_THRESHOLD,
} from "@/stores/useTransactionDraftStore";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/transaction/parse";

const capitalizeFirstLetter = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

/**
 * Stateless GenAI extraction mutation for the AI draft transaction pipeline.
 * POSTs the free-text prompt and/or base64 receipt image to
 * `POST /api/transaction/parse` and loads the response into the transient
 * `useTransactionDraftStore`. See sdd/ai-draft-transaction-pipeline.md §3.2.2.
 */
export const useParseTransactionDraft = () => {
  const guardOnline = useOfflineWriteGuard();
  const setParsedDraft = useTransactionDraftStore((s) => s.setParsedDraft);
  const startAutoConfirm = useTransactionDraftStore((s) => s.startAutoConfirm);
  const setErrorMessage = useTransactionDraftStore((s) => s.setErrorMessage);
  const updateDraftField = useTransactionDraftStore((s) => s.updateDraftField);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: ParseTransactionDraftRequest) =>
      sendRequest(KEY, { method: "POST", body: JSON.stringify(request) }),
  });

  const parseDraft = async (request: ParseTransactionDraftRequest) => {
    if (!guardOnline()) return;
    if (!request.text?.trim() && !request.picture) return;

    updateDraftField("pipelineStatus", "parsing");
    setErrorMessage(null);

    try {
      const res = await mutateAsync(request);

      if (!res.ok) {
        const error = (await res.json()) as ParseTransactionDraftErrorResponse;
        setErrorMessage(
          error.message ??
            "AI could not recognize transaction details from the provided input. Please enter values manually."
        );
        return;
      }

      const draft = (await res.json()) as ParseTransactionDraftResponse;

      setParsedDraft(
        {
          description: capitalizeFirstLetter(draft.description),
          amount: draft.amount,
          type: draft.type,
          categoryRef: draft.categoryRef,
          sourceAccountRef: draft.sourceAccountRef,
          destinationAccountRef: draft.destinationAccountRef ?? null,
          createdAt: draft.createdAt ? new Date(draft.createdAt) : new Date(),
        },
        draft.confidence
      );

      if (draft.confidence >= AUTO_CONFIRM_CONFIDENCE_THRESHOLD) {
        startAutoConfirm();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "AI could not recognize transaction details from the provided input. Please enter values manually."
      );
    }
  };

  return { parseDraft, isParsing: isPending };
};
