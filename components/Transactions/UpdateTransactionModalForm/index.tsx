import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import {
  Transaction,
  TransactionCategory,
  transactionCategoryOptions,
} from "@/interfaces/transaction";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { Chip } from "@nextui-org/chip";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";

interface UpdateTransactionModalFormProps {
  item?: Transaction;
  accounts?: { [key: string]: string };
  isOpen: boolean;
  onDismiss: () => void;
}

export const UpdateTransactionModalForm: React.FC<
  UpdateTransactionModalFormProps
> = ({ item, accounts, onDismiss, isOpen }) => {
  const { isMutating, updateTransaction } = useMutateTransaction();
  const [validationError, setValidationError] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [transactonCategoryInput, setTransactonCategoryInput] =
    useState<TransactionCategory>();
  const [amountInput, setAmountInput] = useState<number>();
  const [createdAtInput, setCreatedAtInput] = useState<ZonedDateTime>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setSelectedAccount(
        Object.entries(accounts!).find(
          ([k, v]) => v === item.sourceAccount
        )?.[0] || ""
      );
      setTransactonCategoryInput(item.category as TransactionCategory);
      setCreatedAtInput(
        item.createdAt ? parseAbsoluteToLocal(item.createdAt) : undefined
      );
      setAmountInput(item.amount);
    }
  }, [item, accounts]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setDescriptionInput("");
    setTransactonCategoryInput(undefined);
    setCreatedAtInput(undefined);
    setAmountInput(0);
  };

  const clearError = () => setValidationError("");

  const validateForm = () => {
    if (
      !descriptionInput ||
      !selectedAccount ||
      !transactonCategoryInput ||
      !createdAtInput ||
      amountInput === 0
    ) {
      throw new Error("Filled all the required fields. Please fill them out.");
    }

    clearError();
  };

  const onSave = async () => {
    try {
      validateForm();

      const payload: Transaction = {
        ...item!,
        description: descriptionInput,
        sourceAccount: selectedAccount,
        createdAt: createdAtInput!.toDate().toISOString(),
        amount: amountInput!,
        category: transactonCategoryInput,
      };

      await updateTransaction(payload);

      clearInputs();
      onDismiss();
    } catch (error) {
      setValidationError((error as Error).message);
    }
  };

  return (
    <>
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
                Update transaction
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Deescription"
                  variant="bordered"
                  isRequired
                  value={descriptionInput}
                  onValueChange={setDescriptionInput}
                />
                <BankAccounDropdown
                  label="Bank account"
                  accounts={accounts}
                  onChange={setSelectedAccount}
                  value={selectedAccount}
                  isRequired
                />
                <div className="flex gap-2">
                  <Autocomplete
                    allowsCustomValue
                    label="Category"
                    variant="bordered"
                    isRequired
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
                    label="Amount"
                    variant="bordered"
                    type="text"
                    isRequired
                    value={amountInput?.toString()}
                    onValueChange={(v) => setAmountInput(v.floatValue)}
                  />
                </div>
                <DatePicker
                  label="Created at"
                  variant="bordered"
                  granularity="minute"
                  value={createdAtInput}
                  onChange={(v) => setCreatedAtInput(v)}
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
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isMutating}
                  disabled={areButtonsDisabled}
                  onPress={onSave}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
