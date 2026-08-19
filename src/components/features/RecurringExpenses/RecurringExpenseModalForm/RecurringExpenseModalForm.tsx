import React, { useEffect, useState } from "react";
import {
  Button,
  Calendar,
  Chip,
  DateField,
  DatePicker,
  FieldError,
  Input,
  InputGroup,
  Label,
  Modal,
  Switch,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  parseAbsoluteToLocal,
  ZonedDateTime,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "@internationalized/date";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import type { CreateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/create-recurring-expense.port";
import { FrequencyDropdown } from "@/components/FrequencyDropdown";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurringExpense";
import { IconComment, IconLink } from "@/components/shared/icons";
import { CategoriesAutocomplete } from "@/components/CategoriesAutocomplete";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { Env } from "@/config/env";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";
import { useToast } from "@/hooks/useToast";

const fixedMonth = parseAbsoluteToLocal(
  new Date(Env.NEXT_PUBLIC_FIXED_MONTH).toISOString()
);

interface RecurringExpenseModalFormProps {
  item?: RecurringExpenseOutput;
  isOpen: boolean;
  onDismiss: () => void;
}

export const RecurringExpenseModalForm: React.FC<
  RecurringExpenseModalFormProps
> = ({ item, onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { showSuccessToast } = useToast();
  const { isMutating, createConfig, updateConfig } =
    useMutateRecurringExpenses();
  const [validationError, setValidationError] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [paymentLinkInput, setPaymentLinkInput] = useState<string>();
  const [notesInput, setNotesInput] = useState<string>();
  const [transactonCategoryInput, setTransactonCategoryInput] =
    useState<CategoryModel["ref"] | undefined>();
  const [frequencyInput, setFrequencyInput] = useState<Frequency>(
    Frequency.MONTHLY
  );
  const [amountInput, setAmountInput] = useState<number>();
  const [dueDateInput, setDueDateInput] = useState<ZonedDateTime>();
  const [disabledInput, setDisabledInput] = useState<boolean>(false);
  const [dueDateMinMax, setDueDateMinMax] = useState<{
    min: ZonedDateTime;
    max: ZonedDateTime;
  }>();

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setTransactonCategoryInput(item.category.ref);
      setFrequencyInput(item.frequency);
      setDueDateInput(
        item.dueDate ? parseAbsoluteToLocal(item.dueDate) : undefined
      );
      setDisabledInput(item.disabled);
      setAmountInput(item.amount);
      setPaymentLinkInput(item.paymentLink);
      setNotesInput(item.notes);
    }
  }, [item]);

  useEffect(() => {
    if (frequencyInput === Frequency.MONTHLY) {
      const min = startOfMonth(fixedMonth);
      const max = endOfMonth(fixedMonth);
      setDueDateMinMax({ min, max });
    } else {
      const min = startOfYear(fixedMonth);
      const max = endOfYear(fixedMonth);
      setDueDateMinMax({ min, max });
    }
  }, [frequencyInput]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setDescriptionInput("");
    setTransactonCategoryInput(undefined);
    setFrequencyInput(Frequency.MONTHLY);
    setDisabledInput(false);
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
      setValidationError(t("allFieldAreRequired"));
      return;
    }

    clearError();

    const isUpdate = !!item?.id;
    const payload: CreateRecurringExpenseInput = {
      description: descriptionInput,
      frequency: frequencyInput,
      dueDate: dueDateInput.toDate(),
      disabled: disabledInput,
      amount: amountInput!,
      category: transactonCategoryInput,
      paymentLink: paymentLinkInput,
      notes: notesInput,
    };
    (isUpdate
      ? updateConfig({ id: item.id, ...payload })
      : createConfig(payload)
    )
      .then(() => {
        clearInputs();
        onDismiss();
        showSuccessToast({
          title: t(
            isUpdate ? "recurringExpenseUpdated" : "recurringExpenseCreated"
          ),
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
            <Modal.Header className="flex flex-row justify-between pr-6 mt-4">
              <Modal.Heading>{t("recurringExpenses")}</Modal.Heading>
              <Switch
                aria-label={t("disabled")}
                size="sm"
                isSelected={!disabledInput}
                onChange={(v) => setDisabledInput(!v)}
              >
                <Switch.Content>
                  <Switch.Control className="flex items-center gap-2">
                    <HiPlusSm />
                    <Switch.Thumb />
                    <HiMinusSm />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
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
                <CategoriesAutocomplete
                  label={t("category")}
                  isRequired
                  value={transactonCategoryInput}
                  onChange={setTransactonCategoryInput}
                />

                <MaskedCurrencyInput
                  label={t("amount")}
                  variant="secondary"
                  type="text"
                  isRequired
                  value={amountInput?.toString()}
                  onValueChange={(v) => setAmountInput(v.floatValue)}
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
                  granularity="day"
                  minValue={dueDateMinMax?.min}
                  maxValue={dueDateMinMax?.max}
                  value={dueDateInput ?? null}
                  onChange={(v) => setDueDateInput(v!)}
                  isRequired
                >
                  <Label>{t("dueDate")}</Label>
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
                    <Calendar aria-label={t("dueDate")}>
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
                          {(day) => (
                            <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                          )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                          {({ year }) => (
                            <Calendar.YearPickerCell year={year} />
                          )}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>
              </div>
              <TextField value={paymentLinkInput} onChange={setPaymentLinkInput}>
                <Label>{t("paymentLink")}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Prefix>
                    <IconLink />
                  </InputGroup.Prefix>
                  <InputGroup.Input />
                </InputGroup>
              </TextField>
              <TextField value={notesInput} onChange={setNotesInput}>
                <Label>{t("notes")}</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    <IconComment size={20} />
                  </InputGroup.Prefix>
                  <TextArea
                    variant="secondary"
                    placeholder={t("notesPlaceholder")}
                  />
                </InputGroup>
              </TextField>
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
