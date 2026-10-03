import React, { useEffect, useMemo, useState } from "react";
import { Button, Chip, Modal, Switch } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Frequency } from "@/app/api/domain/recurring-expense/model/recurring-expense.model";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import type { CreateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/create-recurring-expense.port";
import type { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurringExpense";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { fetchJson } from "@/config/request";
import { formatCurrency, getMonthlyEquivalentAmount } from "@/config/utils";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { InlineEditableTitle } from "@/components/shared/InlineChips";
import { RecurringExpenseChipsGroup } from "./RecurringExpenseChipsGroup";

const CATEGORY_WITH_BUDGET_KEY = "/api/category/with-budget";

interface GetCategoriesWithBudgetStatusOutput {
  categories: CategoryWithBudgetStatusOutput[];
}

interface RecurringExpenseModalFormProps {
  item?: RecurringExpenseOutput;
  defaultCategoryRef?: CategoryModel["ref"];
  isOpen: boolean;
  onDismiss: () => void;
}

export const RecurringExpenseModalForm: React.FC<
  RecurringExpenseModalFormProps
> = ({ item, defaultCategoryRef, onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.RecurringExpenses);
  const { showSuccessToast } = useToast();
  const { isMutating, createConfig, updateConfig } =
    useMutateRecurringExpenses();
  const [validationError, setValidationError] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [paymentLinkInput, setPaymentLinkInput] = useState<string>();
  const [notesInput, setNotesInput] = useState<string>();
  const [transactonCategoryInput, setTransactonCategoryInput] = useState<
    CategoryModel["ref"] | undefined
  >();
  const [frequencyInput, setFrequencyInput] = useState<Frequency>(
    Frequency.MONTHLY,
  );
  const [amountInput, setAmountInput] = useState<number>();
  const [dueDateInput, setDueDateInput] = useState<Date>();
  const [disabledInput, setDisabledInput] = useState<boolean>(false);

  const areButtonsDisabled = isMutating || validationError !== "";

  const { data: categoriesWithBudgetResponse } =
    useQuery<GetCategoriesWithBudgetStatusOutput>({
      queryKey: [CATEGORY_WITH_BUDGET_KEY],
      queryFn: () =>
        fetchJson<GetCategoriesWithBudgetStatusOutput>(
          CATEGORY_WITH_BUDGET_KEY,
        ),
      enabled: isOpen,
    });

  const overBudgetWarning = useMemo(() => {
    const selectedCategory = categoriesWithBudgetResponse?.categories.find(
      (category) => category.ref === transactonCategoryInput,
    );
    const budgetLimit = selectedCategory?.budget?.limit;

    if (!budgetLimit) {
      return undefined;
    }

    const previousContribution =
      item && item.category.ref === transactonCategoryInput && !item.disabled
        ? getMonthlyEquivalentAmount(item.amount, item.frequency)
        : 0;
    const projectedContribution =
      disabledInput || !amountInput
        ? 0
        : getMonthlyEquivalentAmount(amountInput, frequencyInput);
    const projected =
      (selectedCategory?.committedFromRecurring ?? 0) -
      previousContribution +
      projectedContribution;

    if (projected <= budgetLimit) {
      return undefined;
    }

    return t("overBudgetWarning", {
      projected: formatCurrency(projected),
      limit: formatCurrency(budgetLimit),
    });
  }, [
    categoriesWithBudgetResponse,
    transactonCategoryInput,
    amountInput,
    frequencyInput,
    disabledInput,
    item,
    t,
  ]);

  useEffect(() => {
    if (item) {
      setDescriptionInput(item.description);
      setTransactonCategoryInput(item.category.ref);
      setFrequencyInput(item.frequency);
      setDueDateInput(item.dueDate ? new Date(item.dueDate) : undefined);
      setDisabledInput(item.disabled);
      setAmountInput(item.amount);
      setPaymentLinkInput(item.paymentLink);
      setNotesInput(item.notes);
    } else if (defaultCategoryRef) {
      setTransactonCategoryInput(defaultCategoryRef);
    }
  }, [item, defaultCategoryRef]);

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
      dueDate: dueDateInput,
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
            isUpdate ? "recurringExpenseUpdated" : "recurringExpenseCreated",
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
        <ModalContainer>
          <Modal.Dialog aria-label={t("recurringExpenses")}>
            <Modal.Body className="flex flex-col gap-4">
              <div className="flex flex-row items-center gap-2">
                <Switch
                  aria-label={t("disabled")}
                  size="sm"
                  isSelected={!disabledInput}
                  onChange={(v) => setDisabledInput(!v)}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
                <InlineEditableTitle
                  value={descriptionInput}
                  onChange={setDescriptionInput}
                  placeholder={t("description")}
                  isRequired
                />
              </div>
              <RecurringExpenseChipsGroup
                categoryRef={transactonCategoryInput}
                onCategoryChange={setTransactonCategoryInput}
                amount={amountInput}
                onAmountChange={setAmountInput}
                frequency={frequencyInput}
                onFrequencyChange={setFrequencyInput}
                dueDate={dueDateInput}
                onDueDateChange={setDueDateInput}
                paymentLink={paymentLinkInput}
                onPaymentLinkChange={setPaymentLinkInput}
                notes={notesInput}
                onNotesChange={setNotesInput}
              />
              {!validationError && overBudgetWarning && (
                <Chip
                  variant="soft"
                  color="warning"
                  className="text-wrap max-w-full w-full h-fit p-2 rounded-sm"
                >
                  {overBudgetWarning}
                </Chip>
              )}
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
