"use client";

import React, { useEffect, useState } from "react";
import { Button, Chip, Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { useMutateCategory } from "@/hooks/useMutateCategory";
import { formatCurrency } from "@/config/utils";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { LoadingButton } from "@/components/shared/LoadingButton";
import {
  InlineAmountChip,
  InlineSelectChip,
  InlineSelectOption,
} from "@/components/shared/InlineChips";
import type { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";

interface CategoryBudgetModalFormProps {
  category?: CategoryWithBudgetStatusOutput;
  isOpen: boolean;
  onDismiss: () => void;
}

const NO_THRESHOLD = "none";

export const CategoryBudgetModalForm: React.FC<
  CategoryBudgetModalFormProps
> = ({ category, onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const { showSuccessToast } = useToast();
  const { isMutating, updateConfig, customizeConfig } = useMutateCategory();
  const [validationError, setValidationError] = useState<string>("");
  const [limitInput, setLimitInput] = useState<number>();
  const [alertThresholdInput, setAlertThresholdInput] =
    useState<string>(NO_THRESHOLD);

  const alertThresholdOptions: InlineSelectOption<string>[] = [
    { id: NO_THRESHOLD, label: t("noAlert") },
    { id: "50", label: "50%" },
    { id: "75", label: "75%" },
    { id: "90", label: "90%" },
    { id: "100", label: "100%" },
  ];

  const areButtonsDisabled = isMutating;

  useEffect(() => {
    if (isOpen && category) {
      setLimitInput(
        category.budget?.limit ??
          (category.committedFromRecurring > 0
            ? category.committedFromRecurring
            : undefined)
      );
      setAlertThresholdInput(
        category.budget?.alertThreshold !== undefined
          ? String(category.budget.alertThreshold)
          : NO_THRESHOLD
      );
    }
  }, [category, isOpen]);

  const onOpenChangeHandler = (_open: boolean) => {
    onDismiss();
    clearInputs();
  };

  const clearInputs = () => {
    setLimitInput(undefined);
    setAlertThresholdInput(NO_THRESHOLD);
  };

  const clearError = () => setValidationError("");

  const onSave = () => {
    if (!category || !limitInput) {
      setValidationError(t("limitRequired"));
      return;
    }

    clearError();

    const budget = {
      limit: limitInput,
      alertThreshold:
        alertThresholdInput === NO_THRESHOLD
          ? undefined
          : Number(alertThresholdInput),
    };

    (category.isCustom
      ? updateConfig({ id: category.id, budget })
      : customizeConfig({ ref: category.ref, budget })
    )
      .then(() => {
        clearInputs();
        onDismiss();
        showSuccessToast({ title: t("budgetUpdated") });
      })
      .catch((error) => setValidationError(error.message ?? String(error)));
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
          <Modal.Dialog aria-label={t("setBudget")}>
            <Modal.Body className="flex flex-col gap-4">
              <div className="flex flex-row items-center gap-2">
                <span className="text-2xl">{category?.icon}</span>
                <span className="font-semibold">{category?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <InlineAmountChip
                  amount={limitInput}
                  isRequired
                  onAmountChange={setLimitInput}
                />
                <InlineSelectChip
                  value={alertThresholdInput}
                  options={alertThresholdOptions}
                  onChange={setAlertThresholdInput}
                  ariaLabel={t("alertThreshold")}
                />
              </div>
              {!!category?.committedFromRecurring && (
                <Chip
                  variant="soft"
                  color="accent"
                  className="text-wrap max-w-full w-full h-fit p-2 rounded-sm"
                >
                  {t("committedFromRecurringHint", {
                    amount: formatCurrency(category.committedFromRecurring),
                  })}
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
