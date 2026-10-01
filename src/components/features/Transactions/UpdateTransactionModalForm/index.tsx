import React, { useEffect, useState } from "react";
import { Button, Chip, Modal } from "@heroui/react";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import { TransactionType } from "@/app/api/domain/transaction/model/transaction.model";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { InlineEditableTitle } from "@/components/shared/InlineChips";
import { TransactionEditChipsGroup } from "./TransactionEditChipsGroup";

interface UpdateTransactionModalFormProps {
  item?: TransactionOutput;
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
  const [typeInput, setTypeInput] = useState<TransactionType>(
    TransactionType.EXPENSE,
  );
  const [sourceAccountInput, setSourceAccountInput] = useState<string>("");
  const [destinationAccountInput, setDestinationAccountInput] =
    useState<string>("");
  const [transactonCategoryInput, setTransactonCategoryInput] =
    useState<CategoryModel["ref"] | undefined>();
  const [amountInput, setAmountInput] = useState<number>();
  const [createdAtInput, setCreatedAtInput] = useState<Date>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setTypeInput(item.type);
      setSourceAccountInput(item.sourceAccount.ref);
      item.destinationAccount &&
        setDestinationAccountInput(item.destinationAccount.ref);
      setTransactonCategoryInput(item.category?.ref);
      setCreatedAtInput(item.createdAt ? new Date(item.createdAt) : undefined);
      setAmountInput(item.amount);
    }
  }, [item]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setDescriptionInput("");
    setTypeInput(TransactionType.EXPENSE);
    setSourceAccountInput("");
    setDestinationAccountInput("");
    setTransactonCategoryInput(undefined);
    setCreatedAtInput(undefined);
    setAmountInput(0);
  };

  const clearError = () => setValidationError("");

  const onTypeChange = (nextType: TransactionType) => {
    if (nextType === TransactionType.TRANSFER) {
      setTransactonCategoryInput(undefined);
    } else {
      setDestinationAccountInput("");
    }
    setTypeInput(nextType);
  };

  const validateForm = () => {
    const isTransfer = typeInput === TransactionType.TRANSFER;

    if (
      !descriptionInput ||
      !sourceAccountInput ||
      !createdAtInput ||
      amountInput === 0 ||
      (isTransfer && !destinationAccountInput)
    ) {
      throw new Error(t("requiredFieldsMissing"));
    }

    clearError();
  };

  const onSave = async () => {
    try {
      validateForm();

      const payload: UpdateTransactionInput = {
        ...item!,
        description: descriptionInput,
        type: typeInput,
        sourceAccount: sourceAccountInput,
        destinationAccount: destinationAccountInput,
        createdAt: createdAtInput!.toISOString(),
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
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChangeHandler}
        isDismissable={false}
      >
        <ModalContainer>
          <Modal.Dialog aria-label={t("updateTransaction")}>
            <Modal.Body className="flex flex-col gap-4">
              <InlineEditableTitle
                value={descriptionInput}
                onChange={setDescriptionInput}
                placeholder={t("description")}
                isRequired
              />
              <TransactionEditChipsGroup
                type={typeInput}
                onTypeChange={onTypeChange}
                amount={amountInput}
                onAmountChange={setAmountInput}
                sourceAccountRef={sourceAccountInput}
                onSourceAccountChange={setSourceAccountInput}
                destinationAccountRef={destinationAccountInput}
                onDestinationAccountChange={setDestinationAccountInput}
                categoryRef={transactonCategoryInput}
                onCategoryChange={setTransactonCategoryInput}
                createdAt={createdAtInput}
                onCreatedAtChange={setCreatedAtInput}
              />
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
                onPress={() => onOpenChangeHandler(false)}
              >
                {t("cancel")}
              </Button>
              <LoadingButton
                variant="primary"
                isPending={isMutating}
                isDisabled={areButtonsDisabled}
                onPress={onSave}
              >
                {t("save")}
              </LoadingButton>
            </Modal.Footer>
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
