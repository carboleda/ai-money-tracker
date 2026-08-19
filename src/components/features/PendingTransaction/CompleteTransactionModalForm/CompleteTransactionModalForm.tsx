import React, { useEffect, useState } from "react";
import {
  Button,
  Calendar,
  Chip,
  DateField,
  DatePicker,
  Label,
  Modal,
} from "@heroui/react";
import { getLocalTimeZone, now, ZonedDateTime } from "@internationalized/date";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
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
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
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

  const onOpenChangeHandler = () => {
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
      category: item?.category?.ref,
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
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChangeHandler}
        isDismissable={false}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="flex flex-col gap-1">
                <span>{t("completeTransaction")}</span>
                <span className="text-sm font-normal subtitle">
                  {item?.description}
                </span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
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
                variant="secondary"
                type="text"
                isRequired
                value={amountInput?.toString()}
                onValueChange={(v) => setAmountInput(v.floatValue)}
              />
              <DatePicker
                granularity="day"
                isRequired
                value={paymentDateInput ?? null}
                onChange={setPaymentDateInput}
              >
                <Label>{t("paidOn")}</Label>
                <DateField.Group fullWidth>
                  <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger>
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover>
                  <Calendar aria-label={t("paidOn")}>
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>
                        {(date) => <Calendar.Cell date={date} />}
                      </Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                      <Calendar.YearPickerGridBody>
                        {({ year }) => <Calendar.YearPickerCell year={year} />}
                      </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>
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
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
