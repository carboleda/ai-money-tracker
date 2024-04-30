"use client";

import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { IconBrain } from "./shared/icons";
import { useState } from "react";
import { KeyboardEvent } from "@react-types/shared";
import { usePlaceholderAnimation } from "@/hooks/usePlaceholderAnimation";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";

const placeholders = [
  "Ingreso por salario de 2000, C1408",
  "Transferencia de C1408 a C2163 por 5000",
  "Gasolina del carro por 3000, C2163",
  "Retiro en cajero por 4000, C1408",
];
const requiredFields = ["amount", "account"];
const validationRegex =
  /(?<amount>\b\d+\b)|(?<account>\b(C\d{1,4}|[A-Z]{1,5})\b)/g;

const getMissinFieldsInPrompt = (inputText: string) => {
  const matches = [...inputText.matchAll(validationRegex)];

  return requiredFields.filter((field) => {
    return !matches.some((match) => match.groups && match?.groups?.[field]);
  });
};

export const TransactionInput = () => {
  const [inputText, setInputText] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [placeholder] = usePlaceholderAnimation(placeholders);
  const { isMutating, createTransaction } = useMutateTransaction();

  const clearInput = () => setInputText("");
  const clearError = () => setValidationError("");

  const onCreateTransaction = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputText) {
      const missinFields = getMissinFieldsInPrompt(inputText);
      if (missinFields.length) {
        setValidationError(
          `Include the ${missinFields.join(" and ")} in your prompt!`
        );
        return;
      }

      clearError();
      createTransaction(inputText).then(clearInput);
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
