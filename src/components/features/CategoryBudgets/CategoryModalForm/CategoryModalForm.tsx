"use client";

import React, { useCallback, useState } from "react";
import { Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { useMutateCategory } from "@/hooks/useMutateCategory";
import { CategoryType } from "@/app/api/domain/category/model/category.model";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { ModalFormFooter } from "@/components/shared/ModalFormFooter";
import { ValidationErrorChip } from "@/components/shared/ValidationErrorChip";
import { InlineEditableTitle } from "@/components/shared/InlineChips";
import { CategoryChipsGroup, NO_THRESHOLD } from "./CategoryChipsGroup";

interface CategoryModalFormProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const CategoryModalForm: React.FC<CategoryModalFormProps> = ({
  onDismiss,
  isOpen,
}) => {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const { showSuccessToast } = useToast();
  const { isMutating, createConfig } = useMutateCategory();
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

    createConfig(payload)
      .then(() => {
        clearInputs();
        onDismiss();
        showSuccessToast({ title: t("categoryCreated") });
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
          <Modal.Dialog aria-label={t("addCategory")}>
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
