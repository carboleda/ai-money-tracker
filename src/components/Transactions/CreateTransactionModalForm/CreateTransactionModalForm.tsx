import React, { Key, useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { ZonedDateTime } from "@internationalized/date";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { FreeTextMode } from "./mode/FreeTextMode";
import { HiCamera, HiDocumentText } from "react-icons/hi";
import { CameraMode } from "./mode/CameraMode";
import { Chip } from "@nextui-org/chip";
import { Tab, Tabs } from "@nextui-org/tabs";
import { getMissingFieldsInPrompt } from "@/config/utils";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

interface CreateTransactionModalFormProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const CreateTransactionModalForm: React.FC<
  CreateTransactionModalFormProps
> = ({ onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const [validationError, setValidationError] = useState<string>("");
  const [isFreeText, setIsFreeText] = useState<boolean>(true);
  const [textInput, setTextInput] = useState<string>("");
  const [picture, setPicture] = useState<string>();
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [createdAtInput, setCreatedAtInput] = useState<ZonedDateTime>();
  const { isMutating, createTransaction } = useMutateTransaction();

  const areButtonsDisabled = isMutating || validationError !== "";

  const onOpenChangeHandler = useCallback(
    (_open?: boolean) => {
      onDismiss();
      clearInputs();
      clearError();
    },
    [onDismiss]
  );

  const onTabChange = (tab: Key) => {
    setIsFreeText(tab === "freeText");
    clearInputs();
    clearError();
  };

  const clearInputs = () => {
    setCreatedAtInput(undefined);
    setTextInput("");
    setPicture("");
    setSelectedAccount("");
    setCreatedAtInput(undefined);
  };

  const clearError = () => setValidationError("");

  const validateForm = () => {
    if (isFreeText && !textInput) {
      throw new Error(t("descriptionIsRequired"));
    }

    if (isFreeText) {
      const missinFields = getMissingFieldsInPrompt(textInput);
      if (missinFields.length) {
        throw new Error(t("descriptionIsInvalid", { missinFields }));
      }
    }

    if (!isFreeText && !(picture && selectedAccount)) {
      throw new Error(t("bankAndAccountAreRquired"));
    }

    clearError();
  };

  const onSave = async () => {
    try {
      validateForm();

      if (isFreeText) {
        await createTransaction({
          text: textInput,
          createdAt: createdAtInput?.toDate()?.toISOString(),
        });
      } else {
        await createTransaction({
          picture: picture!,
          sourceAccount: selectedAccount,
        });
      }

      onOpenChangeHandler();
    } catch (error) {
      setValidationError((error as Error).message);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      onOpenChangeHandler();
    }
  }, [isOpen, onOpenChangeHandler]);

  return (
    <>
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
                {t("newTransaction")}
              </ModalHeader>
              <ModalBody>
                <Tabs
                  aria-label="Modes"
                  color="primary"
                  radius="sm"
                  selectedKey={isFreeText ? "freeText" : "camera"}
                  onSelectionChange={onTabChange}
                >
                  <Tab
                    key="freeText"
                    title={
                      <div className="flex items-center gap-1">
                        <HiDocumentText className="text-lg" />
                        <span>{t("freeTextMode")}</span>
                      </div>
                    }
                    className="flex flex-col gap-2"
                  >
                    <FreeTextMode
                      setText={setTextInput}
                      createdAt={createdAtInput}
                      setCreatedAt={setCreatedAtInput}
                    />
                  </Tab>
                  <Tab
                    key="camera"
                    title={
                      <div className="flex items-center gap-1">
                        <HiCamera className="text-lg" />
                        <span>{t("cameraMode")}</span>
                      </div>
                    }
                    className="flex flex-col gap-2"
                  >
                    <CameraMode
                      setPicture={setPicture}
                      setSelectedAccount={setSelectedAccount}
                    />
                  </Tab>
                </Tabs>

                {validationError && (
                  <Chip
                    variant="flat"
                    color="danger"
                    radius="sm"
                    className="text-wrap max-w-full w-full h-fit p-2"
                  >
                    {validationError}
                  </Chip>
                )}
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
    </>
  );
};
