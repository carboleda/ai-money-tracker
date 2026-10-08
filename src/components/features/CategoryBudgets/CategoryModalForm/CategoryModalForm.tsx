"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Chip, Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { useMutateCategory } from "@/hooks/useMutateCategory";
import { CategoryType } from "@/app/api/domain/category/model/category.model";
import { formatCurrency } from "@/config/utils";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { ModalFormFooter } from "@/components/shared/ModalFormFooter";
import { ValidationErrorChip } from "@/components/shared/ValidationErrorChip";
import { InlineEditableTitle } from "@/components/shared/InlineChips";
import type { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";
import { CategoryChipsGroup, NO_THRESHOLD } from "./CategoryChipsGroup";

interface CategoryModalFormProps {
  category?: CategoryWithBudgetStatusOutput;
  isOpen: boolean;
  onDismiss: () => void;
  useRecurringAsBudget?: boolean;
}

const getInitialLimit = (
  category: CategoryWithBudgetStatusOutput,
  useRecurringAsBudget?: boolean,
): number | undefined => {
  if (useRecurringAsBudget) return category.committedFromRecurring;
  if (category.budget) return category.budget.limit;
  if (category.committedFromRecurring > 0)
    return category.committedFromRecurring;
  return undefined;
};

const getInitialAlertThreshold = (
  category: CategoryWithBudgetStatusOutput,
): string =>
  category.budget?.alertThreshold !== undefined
    ? String(category.budget.alertThreshold)
    : NO_THRESHOLD;

export const CategoryModalForm: React.FC<CategoryModalFormProps> = ({
  category,
  onDismiss,
  isOpen,
  useRecurringAsBudget,
}) => {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const { showSuccessToast } = useToast();
  const { isMutating, createConfig, updateConfig, customizeConfig } =
    useMutateCategory();
  const [validationError, setValidationError] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [iconInput, setIconInput] = useState<string>("");
  const [restrictedTypesInput, setRestrictedTypesInput] = useState<
    CategoryType[]
  >([]);
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [limitInput, setLimitInput] = useState<number>();
  const [alertThresholdInput, setAlertThresholdInput] =
    useState<string>(NO_THRESHOLD);

  const areButtonsDisabled = isMutating || validationError !== "";

  const clearInputs = () => {
    setNameInput("");
    setIconInput("");
    setRestrictedTypesInput([]);
    setDescriptionInput("");
    setLimitInput(undefined);
    setAlertThresholdInput(NO_THRESHOLD);
    setValidationError("");
  };

  useEffect(() => {
    if (category) {
      setNameInput(category.name);
      setIconInput(category.icon);
      setRestrictedTypesInput(category.restrictedTypes);
      setDescriptionInput(category.description || "");
      setLimitInput(getInitialLimit(category, useRecurringAsBudget));
      setAlertThresholdInput(getInitialAlertThreshold(category));
    } else if (isOpen) {
      clearInputs();
    }
  }, [category, isOpen, useRecurringAsBudget]);

  const clearError = () => setValidationError("");

  const onOpenChangeHandler = () => {
    clearInputs();
    onDismiss();
  };

  const createProxiedSetter = useCallback(
    (setter: (...args: any[]) => void) => {
      return (...args: any[]) => {
        if (validationError) {
          clearError();
        }
        setter(...args);
      };
    },
    [validationError],
  );

  const onSave = () => {
    if (!nameInput || !iconInput) {
      setValidationError(t("nameAndIconRequired"));
      return;
    }

    clearError();

    const isUpdate = !!category?.id;
    const payload = {
      name: nameInput,
      icon: iconInput,
      restrictedTypes: restrictedTypesInput,
      description: descriptionInput || undefined,
      budget: limitInput
        ? {
            limit: limitInput,
            alertThreshold:
              alertThresholdInput === NO_THRESHOLD
                ? undefined
                : Number(alertThresholdInput),
          }
        : undefined,
    };

    const mutationFn = () => {
      if (!isUpdate) return createConfig(payload);
      if (category!.isCustom) {
        return updateConfig({ id: category!.id, ...payload });
      }
      return customizeConfig({ ref: category!.ref, ...payload });
    };

    mutationFn()
      .then(() => {
        clearInputs();
        onDismiss();
        showSuccessToast({
          title: t(isUpdate ? "categoryUpdated" : "categoryCreated"),
        });
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
          <Modal.Dialog aria-label={t(category ? "editCategory" : "addCategory")}>
            <Modal.Body className="flex flex-col gap-4">
              <ValidationErrorChip message={validationError} />
              <InlineEditableTitle
                value={nameInput}
                onChange={createProxiedSetter(setNameInput)}
                placeholder={t("name")}
                isRequired
              />
              <CategoryChipsGroup
                icon={iconInput}
                onIconChange={createProxiedSetter(setIconInput)}
                restrictedTypes={restrictedTypesInput}
                onRestrictedTypesChange={setRestrictedTypesInput}
                limit={limitInput}
                onLimitChange={setLimitInput}
                alertThreshold={alertThresholdInput}
                onAlertThresholdChange={setAlertThresholdInput}
              />
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
            </Modal.Body>
            <ModalFormFooter
              isPending={isMutating}
              isDisabled={areButtonsDisabled}
              onCancel={onOpenChangeHandler}
              onSave={onSave}
            />
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
