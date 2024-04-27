"use client";

import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { IconBrain } from "./shared/icons";
import { useState } from "react";
import { KeyboardEvent } from "@react-types/shared";
import { usePlaceholderAnimation } from "@/hooks/usePlaceholderAnimation";
import { useMutateTransaction } from "@/hooks/useMutateTransaction";

const placeholders = [
  "Pago recibo de gas por 1000, C1408",
  "Ingreso por salario de 2000, C1408",
  "Gasolina del carro por 3000, C2163",
  "Retiro en cajero por 4000, C1408",
];

export const TransactionInput = () => {
  const [inputText, setInputText] = useState<string>("");
  const [placeholder] = usePlaceholderAnimation(placeholders);
  const { isMutating, createTransaction } = useMutateTransaction();

  const clearInput = () => {
    setInputText("");
  };

  const onCreateTransaction = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputText) {
      createTransaction(inputText).then(clearInput);
    }
  };

  return (
    <Input
      aria-label="Create transaction"
      labelPlacement="outside"
      type="text"
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
      onKeyDown={onCreateTransaction}
    />
  );
};
