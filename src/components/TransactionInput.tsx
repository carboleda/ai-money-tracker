"use client";

import {
  FieldError,
  InputGroup,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { IconBrain } from "@/components/shared/icons";
import { FormEvent, useState } from "react";
import { usePlaceholderAnimation } from "@/hooks/usePlaceholderAnimation";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";
import { siteConfig } from "@/config/site";
import { getMissingFieldsInPrompt } from "@/config/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        setValidationError(t("descriptionIsInvalid", { missinFields }));
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
      <TextField
        aria-label={t("newTransaction")}
        isInvalid={!!validationError}
        isRequired={isRequired}
      >
        <InputGroup className="bg-default-100">
          <InputGroup.Prefix>
            <IconBrain className="text-base text-default-400 pointer-events-none flex-shrink-0" />
          </InputGroup.Prefix>
          <TextArea
            placeholder={placeholder}
            value={inputText}
            readOnly={isMutating}
            className="input-placeholder-animation text-sm"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onValueChange(e.target.value)
            }
          />
          {isMutating && (
            <InputGroup.Suffix>
              <Spinner size="sm" />
            </InputGroup.Suffix>
          )}
        </InputGroup>
        <FieldError>{validationError}</FieldError>
      </TextField>
    </form>
  );
};
