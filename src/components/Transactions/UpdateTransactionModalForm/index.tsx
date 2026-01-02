import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import {
  Transaction,
  TransactionCategory,
  transactionCategoryOptions,
  TransactionType,
} from "@/interfaces/transaction";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { Chip } from "@heroui/chip";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

interface UpdateTransactionModalFormProps {
  item?: Transaction;
  isOpen: boolean;
  onDismiss: () => void;
}

export const UpdateTransactionModalForm: React.FC<
  UpdateTransactionModalFormProps
> = ({ item, onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { showSuccessToast } = useToast();
  const { isMutating, updateTransaction } = useMutateTransaction();
  const [validationError, setValidationError] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [sourceAccountInput, setSourceAccountInput] = useState<string>("");
  const [destinationAccountInput, setDestinationAccountInput] =
    useState<string>("");
  const [transactonCategoryInput, setTransactonCategoryInput] =
    useState<TransactionCategory>();
  const [amountInput, setAmountInput] = useState<number>();
  const [createdAtInput, setCreatedAtInput] = useState<ZonedDateTime>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setSourceAccountInput(item.sourceAccount || "");
      item.destinationAccount &&
        setDestinationAccountInput(item.destinationAccount || "");
      setTransactonCategoryInput(item.category as TransactionCategory);
      setCreatedAtInput(
        item.createdAt ? parseAbsoluteToLocal(item.createdAt) : undefined
      );
      setAmountInput(item.amount);
    }
  }, [item]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setDescriptionInput("");
    setSourceAccountInput("");
    setDestinationAccountInput("");
    setTransactonCategoryInput(undefined);
    setCreatedAtInput(undefined);
    setAmountInput(0);
  };

  const clearError = () => setValidationError("");

  const validateForm = () => {
    if (
      !descriptionInput ||
      !sourceAccountInput ||
      !createdAtInput ||
      amountInput === 0
    ) {
      throw new Error(t("requiredFieldsMissing"));
    }

    clearError();
  };

  const onSave = async () => {
    try {
      validateForm();

      const payload: Transaction = {
        ...item!,
        description: descriptionInput,
        sourceAccount: sourceAccountInput,
        destinationAccount: destinationAccountInput,
        createdAt: createdAtInput!.toDate().toISOString(),
        amount: amountInput!,
        category: transactonCategoryInput,
      };

      await updateTransaction(payload);

      clearInputs();
      onDismiss();
      showSuccessToast({
        title: t("transactionUpdated"),
      });
    } catch (error) {
      setValidationError((error as Error).message);
    }
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
              {t("updateTransaction")}
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label={t("description")}
                variant="bordered"
                isRequired
                value={descriptionInput}
                onValueChange={setDescriptionInput}
              />
              <div className="flex gap-2">
                <BankAccounDropdown
                  label={t("sourceAccount")}
                  className="w-full"
                  onChange={setSourceAccountInput}
                  value={sourceAccountInput}
                  isRequired
                  skipDisabled
                  showLabel
                />
                {item?.type === TransactionType.TRANSFER && (
                  <BankAccounDropdown
                    label={t("destinationAccount")}
                    className="w-full"
                    onChange={setDestinationAccountInput}
                    value={destinationAccountInput}
                    isRequired
                    skipDisabled
                    showLabel
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Autocomplete
                  allowsCustomValue
                  label={t("category")}
                  variant="bordered"
                  defaultItems={transactionCategoryOptions}
                  selectedKey={transactonCategoryInput}
                  onSelectionChange={(v) =>
                    setTransactonCategoryInput(v as TransactionCategory)
                  }
                >
                  {(item) => (
                    <AutocompleteItem key={item.value}>
                      {item.label}
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <MaskedCurrencyInput
                  label={t("amount")}
                  variant="bordered"
                  type="text"
                  isRequired
                  value={amountInput?.toString()}
                  onValueChange={(v) => setAmountInput(v.floatValue)}
                />
              </div>
              <DatePicker
                label={t("transactionDate")}
                variant="bordered"
                granularity="minute"
                value={createdAtInput}
                onChange={(v) => setCreatedAtInput(v!)}
                isRequired
                hideTimeZone
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
                color="primary"
                isLoading={isMutating}
                disabled={areButtonsDisabled}
                onPress={onSave}
              >
                {t("save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
