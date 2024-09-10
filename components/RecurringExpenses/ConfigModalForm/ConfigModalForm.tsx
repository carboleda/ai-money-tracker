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
import { parseAbsoluteToLocal } from "@internationalized/date";
import { Frequency, RecurringExpense } from "@/interfaces/recurringExpense";
import { FrequencyDropdown } from "@/components/FrequencyDropdown";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurrentExpenseConfig";

interface ConfigRecurringExpenseModalFormProps {
  item?: RecurringExpense;
  isOpen: boolean;
  onDismiss: () => void;
}

export const ConfigRecurringExpenseModalForm: React.FC<
  ConfigRecurringExpenseModalFormProps
> = ({ item, onDismiss, isOpen }) => {
  const { isMutating, createConfig, updateConfig } =
    useMutateRecurringExpenses();
  const [validationError, setValidationError] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [frequencyInput, setFrequencyInput] = useState<Frequency>(
    Frequency.Monthly
  );
  const [dueDateInput, setDueDateInput] = useState<string>();
  const [amountInput, setAmountInput] = useState<number>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setFrequencyInput(item.frequency);
      setDueDateInput(item.dueDate);
      setAmountInput(item.amount);
    }
  }, [item]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setDescriptionInput("");
    setFrequencyInput(Frequency.Monthly);
    setDueDateInput(undefined);
    setAmountInput(0);
  };

  const clearError = () => setValidationError("");

  const onSave = () => {
    if (descriptionInput === "" || dueDateInput === "" || amountInput === 0) {
      setValidationError(
        "Description and amount are required fields. Please fill them out."
      );
      return;
    }

    clearError();
    const payload = {
      description: descriptionInput,
      frequency: frequencyInput,
      dueDate: dueDateInput!,
      amount: amountInput!,
      category: "Housing",
    };
    (item?.id
      ? updateConfig({ id: item.id, ...payload })
      : createConfig(payload)
    )
      .then(() => {
        clearInputs();
        onDismiss();
      })
      .catch((error) => setValidationError(error));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChangeHandler}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Config Recurrent Expense
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Deescription"
                  variant="bordered"
                  value={descriptionInput}
                  onValueChange={setDescriptionInput}
                />
                <FrequencyDropdown
                  selectedFrequency={frequencyInput}
                  onChange={setFrequencyInput}
                />
                <DatePicker
                  label="Due date"
                  variant="bordered"
                  granularity="day"
                  value={
                    dueDateInput ? parseAbsoluteToLocal(dueDateInput) : null
                  }
                  onChange={(v) => setDueDateInput(v.toDate().toISOString())}
                />
                <Input
                  label="Amount"
                  variant="bordered"
                  type="number"
                  value={amountInput?.toString()}
                  onValueChange={(v) => setAmountInput(parseFloat(v))}
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
