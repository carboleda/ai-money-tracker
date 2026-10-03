import React, { useEffect, useState } from "react";
import { Modal } from "@heroui/react";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { ModalFormFooter } from "@/components/shared/ModalFormFooter";
import { ValidationErrorChip } from "@/components/shared/ValidationErrorChip";
import { CompleteTransactionChipsGroup } from "./CompleteTransactionChipsGroup";

interface CompleteTransactionModalFormProps {
  item?: TransactionOutput;
  isOpen: boolean;
  onDismiss: () => void;
}

export const CompleteTransactionModalForm: React.FC<
  CompleteTransactionModalFormProps
> = ({ item, onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { showSuccessToast } = useToast();
  const { isMutating, updateTransaction } = useMutateTransaction();
  const [validationError, setValidationError] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [createdAtInput, setCreatedAtInput] = useState<Date>();
  const [amountInput, setAmountInput] = useState<number>();

  const areButtonsDisabled = isMutating;

  useEffect(() => {
    setCreatedAtInput(new Date());
    setAmountInput(item?.amount);
  }, [item]);

  const onOpenChangeHandler = () => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setSelectedAccount("");
    setCreatedAtInput(undefined);
    setAmountInput(0);
    setValidationError("");
  };

  const clearError = () => setValidationError("");

  const onSave = () => {
    if (selectedAccount === "" || !createdAtInput || amountInput === 0) {
      setValidationError(t("allFieldAreRequired"));
      return;
    }

    clearError();

    const payload: UpdateTransactionInput = {
      ...item!,
      category: item?.category?.ref,
      sourceAccount: selectedAccount,
      destinationAccount: item?.destinationAccount?.ref || "",
      amount: amountInput!,
      createdAt: createdAtInput.toISOString(),
      status: TransactionStatus.COMPLETE,
    };

    updateTransaction(payload)
      .then(() => {
        clearInputs();
        onDismiss();
        showSuccessToast({
          title: t("transactionCompleted"),
        });
      })
      .catch((error) => setValidationError(error));
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
          <Modal.Dialog>
            <Modal.Header className="mb-4">
              <Modal.Heading className="flex flex-col gap-1">
                <span>{t("completeTransaction")}</span>
                <span className="text-sm font-normal text-muted">
                  {item?.description}
                </span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <CompleteTransactionChipsGroup
                type={item?.type}
                amount={amountInput}
                onAmountChange={setAmountInput}
                sourceAccountRef={selectedAccount}
                onSourceAccountChange={setSelectedAccount}
                createdAt={createdAtInput}
                onCreatedAtChange={setCreatedAtInput}
              />
              <ValidationErrorChip message={validationError} />
            </Modal.Body>
            <ModalFormFooter
              isPending={isMutating}
              isDisabled={areButtonsDisabled}
              onCancel={onOpenChangeHandler}
              onSave={onSave}
              saveLabel={t("completeTransationButton")}
            />
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
