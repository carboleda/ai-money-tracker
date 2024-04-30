"use client";

import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { IconBrain } from "./shared/icons";
import { useState } from "react";
import { KeyboardEvent } from "@react-types/shared";
import { usePlaceholderAnimation } from "@/hooks/usePlaceholderAnimation";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { siteConfig } from "@/config/site";
import { getMissingFieldsInPrompt } from "@/config/utils";

export const TransactionInput = () => {
  const [inputText, setInputText] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [placeholder] = usePlaceholderAnimation(siteConfig.placeholders);
  const { isMutating, createTransaction } = useMutateTransaction();

  const clearInput = () => setInputText("");
  const clearError = () => setValidationError("");

  const onCreateTransaction = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputText) {
      const missinFields = getMissingFieldsInPrompt(inputText);
      if (missinFields.length) {
        setValidationError(
          `Include the ${missinFields.join(" and ")} in your prompt!`
        );
        return;
      }

      clearError();
      createTransaction(inputText)
        .then(clearInput)
        .catch((error) => setValidationError(error));
    }
  };

  return (
    <Input
      aria-label="Create transaction"
      labelPlacement="outside"
      type="text"
      size="lg"
      isClearable
      placeholder={placeholder}
      value={inputText}
      readOnly={isMutating}
      classNames={{
        inputWrapper: "bg-default-100",
        input: "input-placeholder-animation text-sm",
      }}
      startContent={
        <IconBrain className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      endContent={isMutating && <Spinner size="sm" />}
      onValueChange={setInputText}
      onClear={clearError}
      onKeyDown={onCreateTransaction}
      isInvalid={!!validationError}
      errorMessage={validationError}
    />
  );
};
