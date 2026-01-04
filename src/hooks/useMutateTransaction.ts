import useSWRMutation from "swr/mutation";
import { CreateTranaction } from "@/interfaces/transaction";
import { sendRequest } from "@/config/request";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";

const KEY = "/api/transaction";

export const useMutateTransaction = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest(KEY));

  const createTransaction = async (payload: CreateTranaction) => {
    const formData = new FormData();
    payload.text && formData.append("text", payload.text);
    payload.picture && formData.append("picture", payload.picture);
    payload.sourceAccount &&
      formData.append("sourceAccount", payload.sourceAccount);
    payload.createdAt && formData.append("createdAt", payload.createdAt);

    return trigger({
      method: "POST",
      body: formData,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }

      return res.json();
    });
  };

  const updateTransaction = async (trasaction: UpdateTransactionInput) => {
    return trigger({ method: "PUT", body: JSON.stringify(trasaction) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
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
