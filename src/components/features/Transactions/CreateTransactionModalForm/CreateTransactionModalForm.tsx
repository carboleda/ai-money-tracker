"use client";

import React, { Key, useCallback, useEffect, useState } from "react";
import { Button, Chip, Modal, Tabs } from "@heroui/react";
import { getLocalTimeZone, now, ZonedDateTime } from "@internationalized/date";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { FreeTextMode } from "./mode/FreeTextMode";
import { HiCamera, HiDocumentText } from "react-icons/hi";
import { CameraMode } from "./mode/CameraMode";
import { getMissingFieldsInPrompt } from "@/config/utils";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useToast } from "@/hooks/useToast";

interface CreateTransactionModalFormProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const CreateTransactionModalForm: React.FC<
  CreateTransactionModalFormProps
> = ({ onDismiss, isOpen }) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const { showSuccessToast } = useToast();
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
    setTextInput("");
    setPicture("");
    setSelectedAccount("");
    setCreatedAtInput(now(getLocalTimeZone()));
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
      showSuccessToast({
        title: t("transactionCreated"),
      });
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
                {t("newTransaction")}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <Tabs
                selectedKey={isFreeText ? "freeText" : "camera"}
                onSelectionChange={onTabChange}
              >
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Modes">
                    <Tabs.Tab id="freeText">
                      <HiDocumentText className="text-lg" />
                      <span>{t("freeTextMode")}</span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="camera">
                      <Tabs.Separator />
                      <HiCamera className="text-lg" />
                      <span>{t("cameraMode")}</span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel id="freeText" className="flex flex-col gap-2">
                  <FreeTextMode
                    setText={createProxiedSetter(setTextInput)}
                    createdAt={createdAtInput}
                    setCreatedAt={createProxiedSetter(setCreatedAtInput)}
                  />
                </Tabs.Panel>
                <Tabs.Panel id="camera" className="flex flex-col gap-2">
                  <CameraMode
                    setPicture={createProxiedSetter(setPicture)}
                    setSelectedAccount={createProxiedSetter(setSelectedAccount)}
                  />
                </Tabs.Panel>
              </Tabs>

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
                isDisabled={isMutating}
                onPress={() => onOpenChangeHandler()}
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
