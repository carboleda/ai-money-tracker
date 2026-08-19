import React, { useEffect, useState } from "react";
import {
  Button,
  Calendar,
  Chip,
  DateField,
  DatePicker,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import { parseAbsoluteToLocal, ZonedDateTime } from "@internationalized/date";
import { CategoriesAutocomplete } from "@/components/CategoriesAutocomplete";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { TransactionOutput } from "@/app/api/domain/transaction/ports/outbound/filter-transactions.port";
import {
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";

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
  const [sourceAccountInput, setSourceAccountInput] = useState<string>("");
  const [destinationAccountInput, setDestinationAccountInput] =
    useState<string>("");
  const [transactonCategoryInput, setTransactonCategoryInput] =
    useState<CategoryModel["ref"] | undefined>();
  const [amountInput, setAmountInput] = useState<number>();
  const [createdAtInput, setCreatedAtInput] = useState<ZonedDateTime>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setSourceAccountInput(item.sourceAccount.ref);
      item.destinationAccount &&
        setDestinationAccountInput(item.destinationAccount.ref);
      setTransactonCategoryInput(item.category?.ref);
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

      const payload: UpdateTransactionInput = {
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
                {t("updateTransaction")}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <TextField
                autoFocus
                isRequired
                value={descriptionInput}
                onChange={setDescriptionInput}
              >
                <Label>{t("description")}</Label>
                <Input variant="secondary" />
                <FieldError />
              </TextField>
              <div className="flex gap-2">
                <BankAccounDropdown
                  label={t("sourceAccount")}
                  className="w-full"
                  onChange={setSourceAccountInput}
                  value={sourceAccountInput}
                  isRequired
                  showLabel
                />
                {item?.type === TransactionType.TRANSFER && (
                  <BankAccounDropdown
                    label={t("destinationAccount")}
                    className="w-full"
                    onChange={setDestinationAccountInput}
                    value={destinationAccountInput}
                    isRequired
                    showLabel
                  />
                )}
              </div>
              <div className="flex gap-2">
                <CategoriesAutocomplete
                  label={t("category")}
                  value={transactonCategoryInput}
                  onChange={setTransactonCategoryInput}
                />

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
                granularity="minute"
                value={createdAtInput ?? null}
                onChange={(v) => setCreatedAtInput(v as ZonedDateTime)}
                isRequired
                hideTimeZone
              >
                <Label>{t("transactionDate")}</Label>
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
                  <Calendar aria-label={t("transactionDate")}>
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
                onPress={() => onOpenChangeHandler(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="primary"
                isPending={isMutating}
                isDisabled={areButtonsDisabled}
                onPress={onSave}
              >
                {t("save")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
