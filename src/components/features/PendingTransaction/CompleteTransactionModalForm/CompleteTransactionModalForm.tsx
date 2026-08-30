import React, { useEffect, useState } from "react";
import { Button, Chip, Modal } from "@heroui/react";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { CustomDateField } from "@/components/shared/CustomDateField";
import { CustomTimeField } from "@/components/shared/CustomTimeField";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";
import { ModalContainer } from "@/components/shared/ModalContainer";

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

  const areButtonsDisabled = isMutating || validationError !== "";

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
                <span className="text-sm font-normal subtitle">
                  {item?.description}
                </span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <div className="self-start w-full">
                <BankAccounDropdown
                  label={t("bankAccount")}
                  className="w-full"
                  showLabel
                  isRequired
                  onChange={(key) => setSelectedAccount(key ?? "")}
                />
              </div>
              <MaskedCurrencyInput
                label={t("amount")}
                variant="secondary"
                type="text"
                isRequired
                value={amountInput?.toString()}
                onValueChange={(v) => setAmountInput(v.floatValue)}
              />
              <div className="flex gap-2">
                <CustomDateField
                  label={t("paidOn")}
                  isRequired
                  value={createdAtInput ?? new Date()}
                  onChange={setCreatedAtInput}
                  className="w-full"
                />
                <CustomTimeField
                  label={t("paidOnTime")}
                  isRequired
                  value={createdAtInput ?? new Date()}
                  onChange={setCreatedAtInput}
                  className="w-full"
                />
              </div>
              {validationError && (
                <Chip
                  variant="soft"
                  color="danger"
                  className="text-wrap max-w-full w-full h-fit p-2 rounded-sm"
                >
                  {validationError}
                </Chip>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="danger-soft"
                isDisabled={areButtonsDisabled}
                onPress={onOpenChangeHandler}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="primary"
                isPending={isMutating}
                isDisabled={areButtonsDisabled}
                onPress={onSave}
              >
                {t("completeTransationButton")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
