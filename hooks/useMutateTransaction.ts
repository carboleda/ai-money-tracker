import useSWRMutation from "swr/mutation";

interface TransactionRequest {
  method: "POST" | "DELETE";
  body: string;
}

async function sendRequest(url: string, { arg }: { arg: TransactionRequest }) {
  return fetch(url, {
    method: arg.method,
    body: arg.body,
  });
}

export const useMutateTransaction = () => {
  const { trigger, isMutating } = useSWRMutation(
    "/api/transactions",
    sendRequest
  );

  const createTransaction = async (text: string) => {
    return trigger({ method: "POST", body: text }).then((res) => res.json());
  };

  const deleteTransaction = (id: string) => {
    return trigger({ method: "DELETE", body: id });
  };

  return { isMutating, createTransaction, deleteTransaction };
};
