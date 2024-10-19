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
import { Transaction, TransactionStatus } from "@/interfaces/transaction";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";

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
  const [paymentDateInput, setPaymentDateInput] = useState<string>();
  const [amountInput, setAmountInput] = useState<number>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setPaymentDateInput(item.createdAt);
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
    if (
      selectedAccount === "" ||
      paymentDateInput === "" ||
      amountInput === 0
    ) {
      setValidationError(
        "Filled all the required fields. Please fill them out."
      );
      return;
    }

    clearError();
    const payload: Transaction = {
      ...item!,
      sourceAccount: selectedAccount,
      amount: amountInput!,
      createdAt: paymentDateInput!,
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
                Complete transaction
              </ModalHeader>
              <ModalBody>
                <div className="self-start w-full">
                  <BankAccounDropdown
                    accounts={accounts}
                    label="Bank account"
                    onChange={setSelectedAccount}
                  />
                </div>
                <Input
                  label="Amount"
                  variant="bordered"
                  type="number"
                  value={amountInput?.toString()}
                  onValueChange={(v) => setAmountInput(parseFloat(v))}
                />
                <DatePicker
                  label="Paid on"
                  variant="bordered"
                  granularity="day"
                  value={
                    paymentDateInput
                      ? parseAbsoluteToLocal(paymentDateInput)
                      : null
                  }
                  onChange={(v) =>
                    setPaymentDateInput(v.toDate().toISOString())
                  }
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
