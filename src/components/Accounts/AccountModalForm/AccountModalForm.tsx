import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Account } from "@/interfaces/account";
import { useMutateAccount } from "@/hooks/useMutateAccount";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { MaskedCurrencyInput } from "@/components/shared/MaskedCurrencyInput";
import { AccountType } from "@/app/api/domain/account/model/account.model";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";

// Dynamically import to avoid SSR issues
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false, loading: () => <div>Loading emojis...</div> }
);

const DEFAULT_ICON = "🏦";

const ACCOUNT_TYPES: { label: string; value: AccountType }[] = [
  { label: "saving", value: AccountType.SAVING },
  { label: "credit", value: AccountType.CREDIT },
  { label: "investment", value: AccountType.INVESTMENT },
];

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

  const onOpenChangeHandler = (open: boolean) => {
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
              {t("accounts")}
            </ModalHeader>
            <ModalBody>
              {validationError && (
                <div className="text-red-500 text-sm">{validationError}</div>
              )}
              <div className="flex gap-2">
                <Input
                  label={t("ref")}
                  variant="bordered"
                  isRequired
                  value={refInput}
                  onValueChange={createProxiedSetter(setRefInput)}
                  disabled={!!item}
                  placeholder="e.g., C1408"
                />
                <Popover
                  isOpen={isEmojiPickerOpen}
                  onOpenChange={setIsEmojiPickerOpen}
                  placement="bottom"
                >
                  <PopoverTrigger>
                    <Button
                      isIconOnly
                      variant="bordered"
                      className="text-2xl h-14 w-16"
                      title={t("icon")}
                    >
                      {iconInput || DEFAULT_ICON}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
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
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                autoFocus
                label={t("name")}
                variant="bordered"
                isRequired
                value={nameInput}
                onValueChange={createProxiedSetter(setNameInput)}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="justify-start">
                    {t(
                      ACCOUNT_TYPES.find((t) => t.value === typeInput)?.label ||
                        "saving"
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  onSelectionChange={(keys: any) => {
                    const selected = Array.from(keys)[0] as AccountType;
                    setTypeInput(selected);
                  }}
                  selectedKeys={new Set([typeInput])}
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <DropdownItem key={type.value}>
                      {t(type.label)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <MaskedCurrencyInput
                label={t("balance")}
                variant="bordered"
                type="text"
                isRequired
                value={balanceInput?.toString()}
                onValueChange={(v) =>
                  createProxiedSetter(setBalanceInput)(v.floatValue || 0)
                }
              />
              <Input
                label={t("description")}
                variant="bordered"
                value={descriptionInput}
                onValueChange={setDescriptionInput}
                placeholder={t("description")}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                disabled={areButtonsDisabled}
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                color="primary"
                isLoading={isMutating}
                disabled={areButtonsDisabled}
                onPress={onSave}
              >
                {t("save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
