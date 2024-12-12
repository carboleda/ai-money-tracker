"use client";

import { Textarea } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { IconBrain } from "./shared/icons";
import { FormEvent, useState } from "react";
import { usePlaceholderAnimation } from "@/hooks/usePlaceholderAnimation";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { siteConfig } from "@/config/site";
import { getMissingFieldsInPrompt } from "@/config/utils";

export interface TransactionInputProps {
  isRequired?: boolean;
  createOnSubmit?: boolean;
  onChanged?: (value: string) => void;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({
  isRequired = false,
  createOnSubmit = true,
  onChanged,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [placeholder] = usePlaceholderAnimation(siteConfig.placeholders);
  const { isMutating, createTransaction } = useMutateTransaction();

  const clearInput = () => setInputText("");
  const clearError = () => setValidationError("");

  const onValueChange = (value: string) => {
    setInputText(value);
    onChanged && onChanged(value);
  };

  const onCreateTransaction = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (inputText) {
      const missinFields = getMissingFieldsInPrompt(inputText);
      if (missinFields.length) {
        setValidationError(
          `Include the ${missinFields.join(" and ")} in your prompt!`
        );
        return;
      }

      clearError();

      if (!createOnSubmit) {
        return;
      }

      createTransaction({ text: inputText, createdAt: "" })
        .then(clearInput)
        .catch((error) => setValidationError(error));
    }
  };

  return (
    <form
      className="w-full"
      {...(createOnSubmit && { onSubmit: onCreateTransaction })}
    >
      <Textarea
        aria-label="Create transaction"
        labelPlacement="outside"
        variant="bordered"
        type="text"
        size="lg"
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
        onValueChange={onValueChange}
        onClear={clearError}
        isInvalid={!!validationError}
        isRequired={isRequired}
        errorMessage={validationError}
      />
    </form>
  );
};
