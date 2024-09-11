import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { Transaction } from "@/interfaces/transaction";

interface TransactionRequest {
  method: "POST" | "DELETE" | "PUT";
  body: string;
}

const KEY = "/api/transaction";

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
    return trigger({ method: "POST", body: text }).then((res) => {
      if (res.status !== 200) {
        return Promise.reject(res.statusText);
      }

      return res.json();
    });
  };

  const updateTransaction = async (trasaction: Transaction) => {
    return trigger({ method: "PUT", body: JSON.stringify(trasaction) }).then(
      (res) => {
        if (res.status !== 200) {
          return Promise.reject(res.statusText);
        }

        return res.json();
      }
    );
  };

  const deleteTransaction = (id: string) => {
    return trigger({ method: "DELETE", body: id });
  };

  return {
    isMutating,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
