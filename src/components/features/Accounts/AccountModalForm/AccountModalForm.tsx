import React, { useCallback, useEffect, useState } from "react";
import { Button, Chip, Modal } from "@heroui/react";
import { Account, DEFAULT_ICON } from "@/interfaces/account";
import { useMutateAccount } from "@/hooks/useMutateAccount";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import { ModalContainer } from "@/components/shared/ModalContainer";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { InlineEditableTitle } from "@/components/shared/InlineChips";
import { AccountChipsGroup } from "./AccountChipsGroup";

interface AccountModalFormProps {
  item?: Account;
  isOpen: boolean;
  onDismiss: () => void;
}

export const AccountModalForm: React.FC<AccountModalFormProps> = ({
  item,
  onDismiss,
  isOpen,
}) => {
  const { t } = useTranslation(LocaleNamespace.Accounts);
  const { showSuccessToast } = useToast();
  const { isMutating, createAccount, updateAccount } = useMutateAccount();
  const [validationError, setValidationError] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [refInput, setRefInput] = useState<string>("");
  const [iconInput, setIconInput] = useState<string>(DEFAULT_ICON);
  const [typeInput, setTypeInput] = useState<AccountType>(AccountType.SAVING);
  const [balanceInput, setBalanceInput] = useState<number>(0);
  const [descriptionInput, setDescriptionInput] = useState<string>("");

  const areButtonsDisabled = isMutating || validationError !== "";

  useEffect(() => {
    if (item) {
      setNameInput(item.name);
      setRefInput(item.ref);
      setIconInput(item.icon);
      setTypeInput(item.type);
      setBalanceInput(item.balance);
      setDescriptionInput(item.description || "");
    } else if (isOpen) {
      // If modal is open but no item, clear the form
      clearInputs();
    }
  }, [item, isOpen]);

  const onOpenChangeHandler = () => {
    clearInputs();
    clearError();
    onDismiss();
  };

  const clearInputs = () => {
    setNameInput("");
    setRefInput("");
    setIconInput("");
    setTypeInput(AccountType.SAVING);
    setBalanceInput(0);
    setDescriptionInput("");
    setValidationError("");
  };

  const clearError = () => setValidationError("");

  const createProxiedSetter = useCallback(
    (setter: (...args: any[]) => void) => {
      return (...args: any[]) => {
        if (validationError) {
          clearError();
        }
        setter(...args);
      };
    },
    [validationError]
  );

  const onSave = () => {
    if (!nameInput || !refInput || !iconInput || !typeInput) {
      setValidationError(t("allFieldAreRequired"));
      return;
    }

    clearError();

    const isUpdate = !!item?.id;
    const payload: any = {
      name: nameInput,
      ref: refInput,
      icon: iconInput,
      type: typeInput,
      balance: balanceInput,
      description: descriptionInput,
    };

    const mutationFn = isUpdate ? updateAccount : createAccount;
    const successMessage = isUpdate ? "accountUpdated" : "accountCreated";

    if (isUpdate) {
      payload.id = item.id;
    }

    mutationFn(payload)
      .then(() => {
        clearInputs();
        onDismiss();
        showSuccessToast({
          title: t(successMessage),
        });
      })
      .catch((error) => {
        setValidationError(error);
      });
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
          <Modal.Dialog aria-label={t("accounts")}>
            <Modal.Body className="flex flex-col gap-4">
              {validationError && (
                <Chip
                  variant="soft"
                  color="danger"
                  className="text-wrap max-w-full w-full h-fit p-2 rounded-sm"
                >
                  {validationError}
                </Chip>
              )}
              <InlineEditableTitle
                value={nameInput}
                onChange={createProxiedSetter(setNameInput)}
                placeholder={t("name")}
                isRequired
              />
              <AccountChipsGroup
                icon={iconInput}
                onIconChange={createProxiedSetter(setIconInput)}
                refValue={refInput}
                onRefChange={createProxiedSetter(setRefInput)}
                isRefDisabled={!!item}
                type={typeInput}
                onTypeChange={createProxiedSetter(setTypeInput)}
                balance={balanceInput}
                onBalanceChange={(value) =>
                  createProxiedSetter(setBalanceInput)(value || 0)
                }
                description={descriptionInput}
                onDescriptionChange={createProxiedSetter(setDescriptionInput)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="danger-soft"
                isDisabled={areButtonsDisabled}
                onPress={onOpenChangeHandler}
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
