import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { ZonedDateTime } from "@internationalized/date";
import { TransactionInput } from "@/components/TransactionInput";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";

interface CreateTransactionModalFormProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const CreateTransactionModalForm: React.FC<
  CreateTransactionModalFormProps
> = ({ onDismiss, isOpen }) => {
  const [validationError, setValidationError] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [createdAtInput, setCreatedAtInput] = useState<ZonedDateTime>();
  const { isMutating, createTransaction } = useMutateTransaction();

  const areButtonsDisabled = isMutating || validationError !== "";

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setCreatedAtInput(undefined);
    setTextInput("");
  };

  const clearError = () => setValidationError("");

  const onSave = () => {
    if (!textInput) {
      setValidationError(
        "Filled all the required fields. Please fill them out."
      );
      return;
    }

    clearError();

    createTransaction({
      text: textInput,
      createdAt: createdAtInput?.toDate()?.toISOString(),
    })
      .then(() => {
        clearInputs();
        onDismiss();
      })
      .catch((error) => setValidationError(error));
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
                New transaction
              </ModalHeader>
              <ModalBody>
                <TransactionInput
                  onChanged={setTextInput}
                  createOnSubmit={false}
                  isRequired
                />
                <DatePicker
                  label="Transaction date"
                  variant="bordered"
                  granularity="minute"
                  value={createdAtInput}
                  onChange={(v) => setCreatedAtInput(v)}
                />
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
