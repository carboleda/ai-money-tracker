import useSWRMutation from "swr/mutation";
import { mutate } from "swr";

interface TransactionRequest {
  method: "POST" | "DELETE";
  body: string;
}

const KEY = "/api/transactions";

async function sendRequest(url: string, { arg }: { arg: TransactionRequest }) {
  return fetch(url, {
    method: arg.method,
    body: arg.body,
  }).then((response) => {
    mutate((key) => typeof key === "string" && key.startsWith(KEY), undefined, {
      revalidate: true,
    });
    return response;
  });
}

export const useMutateTransaction = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest);

  const createTransaction = async (text: string) => {
    return trigger({ method: "POST", body: text }).then((res) => res.json());
  };

  const deleteTransaction = (id: string) => {
    return trigger({ method: "DELETE", body: id });
  };

  return { isMutating, createTransaction, deleteTransaction };
};
