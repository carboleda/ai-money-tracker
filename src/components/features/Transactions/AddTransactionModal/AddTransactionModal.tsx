"use client";

import React, { useCallback } from "react";
import { Button, Modal } from "@heroui/react";
import { HiOutlineSparkles, HiOutlineWifi } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useToast } from "@/hooks/useToast";
import {
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { useTransactionDraftStore } from "@/stores/useTransactionDraftStore";
import { useParseTransactionDraft } from "@/hooks/useParseTransactionDraft";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { useDraftAutoConfirm } from "@/hooks/useDraftAutoConfirm";
import { CreateTransactionPayload } from "@/interfaces/transaction";
import { MultimodalDraftInput } from "./MultimodalDraftInput";
import { InlineDescriptionTitle } from "./InlineDescriptionTitle";
import { DraftChipsGroup } from "./DraftChipsGroup";
import { AutoConfirmSaveButton } from "./AutoConfirmSaveButton";

export interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Unified responsive AI Draft Transaction modal. Bottom sheet on mobile,
 * centered dialog on desktop, sharing 100% of component logic/state via
 * `useTransactionDraftStore`.
 * See sdd/ai-draft-transaction-pipeline.md §4.1 / §4.2 (#1).
 */
export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const isMobile = useIsMobile();
  const { isOnline } = useOnlineStatus();
  const { showSuccessToast } = useToast();

  const {
    prompt,
    description,
    amount,
    type,
    categoryRef,
    sourceAccountRef,
    destinationAccountRef,
    createdAt,
    pipelineStatus,
    errorMessage,
    setDescription,
    cancelAutoConfirm,
    resetDraft,
    closeDraftModal,
    updateDraftField,
  } = useTransactionDraftStore();

  const { parseDraft, isParsing } = useParseTransactionDraft();
  const { createTransaction, isMutating } = useMutateTransaction();

  const hasDraft = pipelineStatus === "drafted" || pipelineStatus === "saving";
  const isSaving = isMutating || pipelineStatus === "saving";

  const isTransfer = type === TransactionType.TRANSFER;
  const isSaveDisabled =
    !isOnline ||
    isSaving ||
    !amount ||
    !sourceAccountRef ||
    (isTransfer &&
      (!destinationAccountRef || destinationAccountRef === sourceAccountRef));

  const onInteraction = useCallback(() => {
    cancelAutoConfirm();
  }, [cancelAutoConfirm]);

  const handleDismiss = useCallback(() => {
    resetDraft();
    closeDraftModal();
    onClose();
  }, [resetDraft, closeDraftModal, onClose]);

  const onOpenChangeHandler = (open: boolean) => {
    if (!open) handleDismiss();
  };

  const handleSave = useCallback(async () => {
    if (isSaveDisabled) return;

    updateDraftField("pipelineStatus", "saving");

    const payload: CreateTransactionPayload = {
      description,
      amount,
      type,
      status: TransactionStatus.COMPLETE,
      sourceAccount: sourceAccountRef,
      destinationAccount: isTransfer
        ? destinationAccountRef ?? undefined
        : undefined,
      category: !isTransfer ? categoryRef : undefined,
      createdAt: createdAt.toISOString(),
    };

    try {
      await createTransaction(payload);
      showSuccessToast({ title: t("transactionCreated") });
      handleDismiss();
    } catch (error) {
      updateDraftField(
        "errorMessage",
        error instanceof Error ? error.message : String(error)
      );
      updateDraftField("pipelineStatus", "error");
    }
  }, [
    isSaveDisabled,
    description,
    amount,
    type,
    isTransfer,
    sourceAccountRef,
    destinationAccountRef,
    categoryRef,
    createdAt,
    createTransaction,
    showSuccessToast,
    t,
    handleDismiss,
    updateDraftField,
  ]);

  useDraftAutoConfirm(handleSave);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSubmitPrompt = ({
    text,
    picture,
  }: {
    text?: string;
    picture?: string;
  }) => {
    parseDraft({ text, picture });
  };

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChangeHandler}
        isDismissable={false}
      >
        <Modal.Container
          placement={isMobile ? "bottom" : "center"}
          className={isMobile ? "p-0 sm:p-0" : undefined}
        >
          <Modal.Dialog className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 rounded-t-3xl md:rounded-2xl shadow-2xl">
            {/*
              `ModalDialogProps extends DialogPrimitiveProps` from
              react-aria-components, whose `DialogProps` deliberately omits
              keyboard/focus event props (see `GlobalDOMEvents` comment:
              "Keyboard and focus events are supported directly on focusable
              elements"). So the Cmd/Ctrl+Enter-to-save trap is attached to a
              plain wrapping `<div>` instead of `<Modal.Dialog>` itself.
            */}
            <div onKeyDown={handleKeyDown}>
              {isMobile && (
                <div className="w-full flex justify-center pt-2">
                  <span className="h-1.5 w-10 rounded-full bg-zinc-700" />
                </div>
              )}
              <Modal.Header>
                <Modal.Heading className="flex items-center justify-between w-full text-zinc-50">
                  <span>
                    {t("newTransaction")}
                    {!isMobile && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        ({t("aiDraft.escToClose")})
                      </span>
                    )}
                  </span>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                {!isOnline && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    <HiOutlineWifi className="text-base shrink-0" />
                    <span>{t("aiDraft.offlineBanner")}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                    {errorMessage}
                  </div>
                )}

                <MultimodalDraftInput
                  isParsing={isParsing}
                  onSubmit={handleSubmitPrompt}
                  onInteraction={onInteraction}
                />

                {hasDraft && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-lime-400">
                      <HiOutlineSparkles />
                      <span>{t("aiDraft.badge")}</span>
                    </div>
                    <InlineDescriptionTitle
                      description={description}
                      onDescriptionChange={setDescription}
                      onInteraction={onInteraction}
                    />
                    <DraftChipsGroup onInteraction={onInteraction} />
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger-soft" onPress={handleDismiss}>
                  {t("cancel")}
                </Button>
                <AutoConfirmSaveButton
                  isDisabled={isSaveDisabled}
                  isSaving={isSaving}
                  onSave={handleSave}
                />
              </Modal.Footer>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
