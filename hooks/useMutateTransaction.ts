import useSWRMutation from "swr/mutation";
import { Transaction } from "@/interfaces/transaction";
import { sendRequest } from "@/config/request";

const KEY = "/api/transaction";

export const useMutateTransaction = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest(KEY));

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
