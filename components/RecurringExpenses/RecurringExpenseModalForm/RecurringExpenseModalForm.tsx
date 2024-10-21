import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import {
  parseAbsoluteToLocal,
  ZonedDateTime,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "@internationalized/date";
import { Frequency, RecurringExpense } from "@/interfaces/recurringExpense";
import { FrequencyDropdown } from "@/components/FrequencyDropdown";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurrentExpense";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import {
  TransactionCategory,
  transactionCategoryOptions,
} from "@/interfaces/transaction";
import { IconComment, IconLink } from "@/components/shared/icons";
import { Env } from "@/config/env";

interface RecurringExpenseModalFormProps {
  item?: RecurringExpense;
  isOpen: boolean;
  onDismiss: () => void;
}

export const RecurringExpenseModalForm: React.FC<
  RecurringExpenseModalFormProps
> = ({ item, onDismiss, isOpen }) => {
  const { isMutating, createConfig, updateConfig } =
    useMutateRecurringExpenses();
  const [validationError, setValidationError] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [paymentLinkInput, setPaymentLinkInput] = useState<string>();
  const [notesInput, setNotesInput] = useState<string>();
  const [transactonCategoryInput, setTransactonCategoryInput] =
    useState<TransactionCategory>();
  const [frequencyInput, setFrequencyInput] = useState<Frequency>(
    Frequency.Monthly
  );
  const [amountInput, setAmountInput] = useState<number>();
  const [dueDateInput, setDueDateInput] = useState<ZonedDateTime>();
  const [dueDateMinMax, setDueDateMinMax] = useState<{
    min: ZonedDateTime;
    max: ZonedDateTime;
  }>();

  const areButtonsDisabled = isMutating || validationError !== "";
  const fixedMonth = parseAbsoluteToLocal(
    new Date(Env.NEXT_PUBLIC_FIXED_MONTH).toISOString()
  );

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setTransactonCategoryInput(item.category);
      setFrequencyInput(item.frequency);
      setDueDateInput(
        item.dueDate ? parseAbsoluteToLocal(item.dueDate) : undefined
      );
      setAmountInput(item.amount);
      setPaymentLinkInput(item.paymentLink);
      setNotesInput(item.notes);
    }
  }, [item]);

  useEffect(() => {
    if (frequencyInput === Frequency.Monthly) {
      const min = startOfMonth(fixedMonth);
      const max = endOfMonth(fixedMonth);
      setDueDateMinMax({ min, max });
    } else {
      const min = startOfYear(fixedMonth);
      const max = endOfYear(fixedMonth);
      setDueDateMinMax({ min, max });
    }
  }, [frequencyInput, fixedMonth]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setDescriptionInput("");
    setTransactonCategoryInput(undefined);
    setFrequencyInput(Frequency.Monthly);
    setDueDateInput(undefined);
    setAmountInput(0);
    setPaymentLinkInput("");
    setNotesInput("");
  };

  const clearError = () => setValidationError("");

  const onSave = () => {
    if (
      descriptionInput === "" ||
      !transactonCategoryInput ||
      !dueDateInput ||
      amountInput === 0
    ) {
      setValidationError(
        "Filled all the required fields. Please fill them out."
      );
      return;
    }

    clearError();
    const payload: Omit<RecurringExpense, "id"> = {
      description: descriptionInput,
      frequency: frequencyInput,
      dueDate: dueDateInput.toDate().toISOString(),
      amount: amountInput!,
      category: transactonCategoryInput,
      paymentLink: paymentLinkInput,
      notes: notesInput,
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
                Recurrent Expense
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

                  <Input
                    label="Amount"
                    variant="bordered"
                    type="number"
                    isRequired
                    value={amountInput?.toString()}
                    onValueChange={(v) => setAmountInput(parseFloat(v))}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-full">
                    <FrequencyDropdown
                      selectedFrequency={frequencyInput}
                      onChange={setFrequencyInput}
                    />
                  </div>
                  <DatePicker
                    label="Due date"
                    variant="bordered"
                    granularity="day"
                    minValue={dueDateMinMax?.min}
                    maxValue={dueDateMinMax?.max}
                    value={dueDateInput}
                    onChange={(v) => setDueDateInput(v)}
                    isRequired
                  />
                </div>
                <Input
                  label="Payment Link"
                  variant="bordered"
                  startContent={<IconLink />}
                  value={paymentLinkInput}
                  onValueChange={setPaymentLinkInput}
                />
                <Textarea
                  label="Notes"
                  placeholder="Enter your notes here"
                  variant="bordered"
                  startContent={<IconComment size={20} />}
                  value={notesInput}
                  onValueChange={setNotesInput}
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
