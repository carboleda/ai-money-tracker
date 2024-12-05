import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { Transaction, TransactionStatus } from "@/interfaces/transaction";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { Chip } from "@nextui-org/chip";

interface CompleteTransactionModalFormProps {
  item?: Transaction;
  accounts?: { [key: string]: string };
  isOpen: boolean;
  onDismiss: () => void;
}

export const CompleteTransactionModalForm: React.FC<
  CompleteTransactionModalFormProps
> = ({ item, accounts, onDismiss, isOpen }) => {
  const { isMutating, updateTransaction } = useMutateTransaction();
  const [validationError, setValidationError] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [paymentDateInput, setPaymentDateInput] =
    useState<ZonedDateTime | null>();
  const [amountInput, setAmountInput] = useState<number>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setPaymentDateInput(
        item.createdAt ? parseAbsoluteToLocal(item.createdAt) : null
      );
      setAmountInput(item.amount);
    }
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
      setValidationError(
        "Filled all the required fields. Please fill them out."
      );
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

    const payload: Transaction = {
      ...item!,
      sourceAccount: selectedAccount,
      amount: amountInput!,
      createdAt,
      status: TransactionStatus.COMPLETE,
    };

    updateTransaction(payload)
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
                <span>Complete transaction</span>
                <span className="text-sm font-normal subtitle">
                  {item?.description}
                </span>
              </ModalHeader>
              <ModalBody>
                <div className="self-start w-full">
                  <BankAccounDropdown
                    label="Bank account"
                    isRequired
                    accounts={accounts}
                    onChange={setSelectedAccount}
                  />
                </div>
                <MaskedCurrencyInput
                  label="Amount"
                  variant="bordered"
                  type="text"
                  isRequired
                  value={amountInput?.toString()}
                  onValueChange={(v) => setAmountInput(v.floatValue)}
                />
                <DatePicker
                  label="Paid on"
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
                  Cancel
                </Button>
                <Button
                  color="success"
                  isLoading={isMutating}
                  disabled={areButtonsDisabled}
                  onPress={onSave}
                >
                  Complete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
