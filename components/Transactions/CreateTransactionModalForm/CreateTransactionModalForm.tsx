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

interface CreateTransactionModalFormProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const CreateTransactionModalForm: React.FC<
  CreateTransactionModalFormProps
> = ({ onDismiss, isOpen }) => {
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
      throw new Error("Description is requited. Please fill it out.");
    }

    if (isFreeText) {
      const missinFields = getMissingFieldsInPrompt(textInput);
      if (missinFields.length) {
        const error = `Include the ${missinFields.join(
          " and "
        )} in your prompt!`;
        throw new Error(error);
      }
    }

    if (!isFreeText && !(picture && selectedAccount)) {
      throw new Error(
        "Back account and Picture are requited. Please fill them out."
      );
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
                New transaction
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
                        <HiDocumentText />
                        <span>Free text mode</span>
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
                        <HiCamera />
                        <span>Camera mode</span>
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
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isMutating}
                  disabled={areButtonsDisabled}
                  onPress={onSave}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
