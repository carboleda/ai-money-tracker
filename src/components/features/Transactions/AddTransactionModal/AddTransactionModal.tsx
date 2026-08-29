"use client";

import React, { useCallback, useState } from "react";
import { Alert, Button, Modal } from "@heroui/react";
import { HiOutlineSparkles } from "react-icons/hi2";
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
import { ModalContainer } from "@/components/shared/ModalContainer";

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
  const [isMicPermissionDenied, setIsMicPermissionDenied] = useState(false);

  const {
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
        ? (destinationAccountRef ?? undefined)
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
        error instanceof Error ? error.message : String(error),
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
        <ModalContainer>
          <Modal.Dialog className="rounded-t-3xl md:rounded-2xl">
            <Modal.Header>
              <Modal.Heading className="flex items-center justify-between w-full">
                <span>{t("newTransaction")}</span>
                {!isMobile && (
                  <span className="ml-2 text-xs font-normal text-muted">
                    ({t("aiDraft.escToClose")})
                  </span>
                )}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              {!isOnline && (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      {t("aiDraft.offlineBanner")}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}

              {errorMessage && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{errorMessage}</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}

              {isMicPermissionDenied && (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      {t("aiDraft.micPermissionDenied")}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}

              <MultimodalDraftInput
                isParsing={isParsing}
                onSubmit={handleSubmitPrompt}
                onInteraction={onInteraction}
                onMicPermissionDenied={setIsMicPermissionDenied}
              />

              {hasDraft && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-accent">
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
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
