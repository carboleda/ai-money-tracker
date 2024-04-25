"use client";

import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { IconBrain, SearchIcon } from "./icons";
import { useRef } from "react";
import useSWRMutation from "swr/mutation";
import { KeyboardEvent } from "@react-types/shared";

async function sendRequest(url: string, { arg }: { arg: string }) {
  return fetch(url, {
    method: "POST",
    body: arg,
  }).then((res) => res.json());
}

export const CreateTransactionInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
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
    <>
      <Input
        aria-label="Create transaction"
        labelPlacement="outside"
        type="text"
        placeholder="Buy groceries by 1000 using account C1234"
        ref={inputRef}
        readOnly={isMutating}
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm",
        }}
        startContent={
          <IconBrain className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        endContent={isMutating && <Spinner size="sm" />}
        onKeyDown={onCreateTransaction}
      />
    </>
  );
};
