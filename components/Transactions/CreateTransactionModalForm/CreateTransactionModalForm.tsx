import React, { useCallback, useEffect, useState } from "react";
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
import { Switch } from "@nextui-org/switch";
import { HiCamera, HiDocumentText } from "react-icons/hi";
import { CameraMode } from "./mode/CameraMode";
import { Chip } from "@nextui-org/chip";

interface CreateTransactionModalFormProps {
  accounts?: { [key: string]: string };
  isOpen: boolean;
  onDismiss: () => void;
}

export const CreateTransactionModalForm: React.FC<
  CreateTransactionModalFormProps
> = ({ accounts, onDismiss, isOpen }) => {
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

  const clearInputs = () => {
    setCreatedAtInput(undefined);
    setTextInput("");
    setPicture("");
    setSelectedAccount("");
    setCreatedAtInput(undefined);
  };

  const clearError = () => setValidationError("");

  const validateForm = () => {
    if (isFreeText && !(textInput && createdAtInput)) {
      throw new Error(
        "Description and Date are requited. Please fill them out."
      );
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
          createdAt: createdAtInput!.toDate().toISOString(),
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
                <Switch
                  defaultSelected
                  size="md"
                  color="secondary"
                  isSelected={isFreeText}
                  onValueChange={setIsFreeText}
                  startContent={<HiDocumentText />}
                  endContent={<HiCamera />}
                >
                  {isFreeText ? "Free text mode" : "Camera mode"}
                </Switch>
                {isFreeText ? (
                  <FreeTextMode
                    setText={setTextInput}
                    setCreatedAtInput={setCreatedAtInput}
                    createdAt={createdAtInput}
                    setCreatedAt={setCreatedAtInput}
                  />
                ) : (
                  <CameraMode
                    accounts={accounts}
                    setPicture={setPicture}
                    setSelectedAccount={setSelectedAccount}
                  />
                )}

                {validationError && (
                  <Chip
                    variant="flat"
                    color="danger"
                    radius="sm"
                    className="text-wrap h-fit p-2"
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
