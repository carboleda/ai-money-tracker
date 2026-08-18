import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTranaction } from "@/interfaces/transaction";
import { sendRequest, invalidateResource, MutationRequest } from "@/config/request";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/transaction";

export const useMutateTransaction = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: MutationRequest) => sendRequest(KEY, request),
    onSuccess: () => invalidateResource(queryClient, KEY),
  });

  const createTransaction = async (payload: CreateTranaction) => {
    if (!guardOnline()) return Promise.reject(new Error("Offline"));

    const formData = new FormData();
    payload.text && formData.append("text", payload.text);
    payload.picture && formData.append("picture", payload.picture);
    payload.sourceAccount &&
      formData.append("sourceAccount", payload.sourceAccount);
    payload.createdAt && formData.append("createdAt", payload.createdAt);

    return mutateAsync({
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
    if (!guardOnline()) return Promise.reject(new Error("Offline"));

    return mutateAsync({ method: "PUT", body: JSON.stringify(trasaction) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const deleteTransaction = (id: string) => {
    if (!guardOnline()) return Promise.resolve();

    return mutateAsync({ method: "DELETE", body: id });
  };

  return {
    isMutating: isPending,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
