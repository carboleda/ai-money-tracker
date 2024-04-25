"use client";

import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { IconBrain } from "./icons";
import { useRef } from "react";
import useSWRMutation from "swr/mutation";
import { KeyboardEvent } from "@react-types/shared";
import { usePlaceholderAnimation } from "@/hooks/placeholder-animation";

const placeholders = [
  "Pago recibo de gas por 1000, C1408",
  "Ingreso por salario de 2000, C1408",
  "Gasolina del carro por 3000, C2163",
  "Retiro en cajero por 4000, C1408",
];

async function sendRequest(url: string, { arg }: { arg: string }) {
  return fetch(url, {
    method: "POST",
    body: arg,
  }).then((res) => res.json());
}

export const CreateTransactionInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder] = usePlaceholderAnimation(placeholders);

  const { trigger, isMutating } = useSWRMutation(
    "/api/transactions",
    sendRequest
  );

  const clearInput = () => (inputRef!.current!.value = "");

  const onCreateTransaction = (e: KeyboardEvent) => {
    if (e.key === "Enter" && inputRef?.current?.value) {
      trigger(inputRef.current.value!).then(clearInput);
    }
  };

  return (
    <Input
      aria-label="Create transaction"
      labelPlacement="outside"
      type="text"
      placeholder={placeholder}
      ref={inputRef}
      readOnly={isMutating}
      classNames={{
        inputWrapper: "bg-default-100",
        input: "input-placeholder-animation text-sm",
      }}
      startContent={
        <IconBrain className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      endContent={isMutating && <Spinner size="sm" />}
      onKeyDown={onCreateTransaction}
    />
  );
};
