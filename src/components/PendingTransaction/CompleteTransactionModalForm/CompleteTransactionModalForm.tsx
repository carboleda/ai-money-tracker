import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import { getLocalTimeZone, now, ZonedDateTime } from "@internationalized/date";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { Chip } from "@heroui/chip";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { TransactionStatus } from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";

interface CompleteTransactionModalFormProps {
  item?: TransactionOutput;
  isOpen: boolean;
  onDismiss: () => void;
}

export const CompleteTransactionModalForm: React.FC<
  CompleteTransactionModalFormProps
> = ({ item, onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.RecurrentExpenses);
  const { showSuccessToast } = useToast();
  const { isMutating, updateTransaction } = useMutateTransaction();
  const [validationError, setValidationError] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [paymentDateInput, setPaymentDateInput] =
    useState<ZonedDateTime | null>();
  const [amountInput, setAmountInput] = useState<number>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    setPaymentDateInput(now(getLocalTimeZone()));
    setAmountInput(item?.amount);
  }, [item]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setSelectedAccount("");
    setPaymentDateInput(undefined);
    setAmountInput(0);
  };

  const clearError = () => setValidationError("");

  const onSave = () => {
    if (selectedAccount === "" || !paymentDateInput || amountInput === 0) {
      setValidationError(t("allFieldAreRequired"));
      return;
    }

    clearError();

    const now = new Date();
    const createdAt = paymentDateInput
      .set({
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      })
      .toDate()
      .toISOString();

    const payload: UpdateTransactionInput = {
      ...item!,
      sourceAccount: selectedAccount,
      destinationAccount: item?.destinationAccount?.ref || "",
      amount: amountInput!,
      createdAt,
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
    <Modal
      placement="top-center"
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChangeHandler}
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span>{t("completeTransaction")}</span>
              <span className="text-sm font-normal subtitle">
                {item?.description}
              </span>
            </ModalHeader>
            <ModalBody>
              <div className="self-start w-full">
                <BankAccounDropdown
                  label={t("bankAccount")}
                  className="w-full"
                  showLabel
                  isRequired
                  onChange={setSelectedAccount}
                />
              </div>
              <MaskedCurrencyInput
                label={t("amount")}
                variant="bordered"
                type="text"
                isRequired
                value={amountInput?.toString()}
                onValueChange={(v) => setAmountInput(v.floatValue)}
              />
              <DatePicker
                label={t("paidOn")}
                variant="bordered"
                granularity="day"
                isRequired
                value={paymentDateInput}
                onChange={setPaymentDateInput}
              />
              {validationError && (
                <Chip
                  variant="flat"
                  color="danger"
                  radius="sm"
                  className="text-wrap max-w-full w-full h-fit p-2"
                >
                  {validationError}
                </Chip>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                disabled={areButtonsDisabled}
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                color="success"
                isLoading={isMutating}
                disabled={areButtonsDisabled}
                onPress={onSave}
              >
                {t("completeTransationButton")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
