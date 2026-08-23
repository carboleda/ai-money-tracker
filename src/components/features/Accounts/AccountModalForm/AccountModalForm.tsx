import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  FieldError,
  Input,
  Label,
  Modal,
  Popover,
  TextField,
} from "@heroui/react";
import { Account, ACCOUNT_TYPES, DEFAULT_ICON } from "@/interfaces/account";
import { useMutateAccount } from "@/hooks/useMutateAccount";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { ModalContainer } from "@/components/shared/ModalContainer";

// Dynamically import to avoid SSR issues
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false, loading: () => <div>Loading emojis...</div> }
);

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
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
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

  const renderEmojiPickerPopover = () => {
    return (
      <Popover isOpen={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <Button
          isIconOnly
          variant="outline"
          className="text-2xl h-14 w-16"
          aria-label={t("icon")}
        >
          {iconInput || DEFAULT_ICON}
        </Button>
        <Popover.Content placement="bottom" className="w-80">
          <Popover.Dialog>
            <div className="px-1 py-2">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  createProxiedSetter(setIconInput)(emojiData.emoji);
                  setIsEmojiPickerOpen(false);
                }}
                theme={Theme.AUTO}
                width="100%"
                height={400}
                previewConfig={{
                  showPreview: false,
                }}
                searchDisabled={false}
                lazyLoadEmojis={true}
              />
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    );
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
          <Modal.Dialog>
            <Modal.Header className="mb-4">
              <Modal.Heading className="flex flex-col gap-1">
                {t("accounts")}
              </Modal.Heading>
            </Modal.Header>
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
              <div className="flex gap-2 w-full">
                {renderEmojiPickerPopover()}
                <TextField
                  isRequired
                  className="w-full"
                  isDisabled={!!item}
                  value={refInput}
                  onChange={createProxiedSetter(setRefInput)}
                >
                  <Label>{t("ref")}</Label>
                  <Input variant="secondary" placeholder="e.g., C1408" />
                  <FieldError />
                </TextField>
              </div>
              <TextField
                autoFocus
                isRequired
                value={nameInput}
                onChange={createProxiedSetter(setNameInput)}
              >
                <Label>{t("name")}</Label>
                <Input variant="secondary" />
                <FieldError />
              </TextField>
              <CustomDropdown
                values={ACCOUNT_TYPES.map((type) => ({
                  key: type.key,
                  label: t(type.label),
                }))}
                label={t("type")}
                value={typeInput}
                isRequired={true}
                showLabel={true}
                onChange={createProxiedSetter(setTypeInput) as any}
              />
              <MaskedCurrencyInput
                label={t("balance")}
                variant="secondary"
                type="text"
                isRequired
                value={balanceInput?.toString()}
                onValueChange={(v) =>
                  createProxiedSetter(setBalanceInput)(v.floatValue || 0)
                }
              />
              <TextField
                value={descriptionInput}
                onChange={setDescriptionInput}
              >
                <Label>{t("description")}</Label>
                <Input variant="secondary" placeholder={t("description")} />
                <FieldError />
              </TextField>
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
                {t("save")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
