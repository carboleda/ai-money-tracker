import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransactionPayload } from "@/interfaces/transaction";
import { sendRequest, invalidateResource, MutationRequest } from "@/config/request";
import { UpdateTransactionInput } from "@/app/api/domain/transaction/ports/inbound/update-transaction.port";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/transaction";
const dependentQueries = [KEY, "/api/account", "/api/summary"];

export const useMutateTransaction = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: MutationRequest) => sendRequest(KEY, request),
    onSuccess: () => invalidateResource(queryClient, dependentQueries),
  });

  const createTransaction = async (payload: CreateTransactionPayload) => {
    if (!guardOnline()) throw new Error("Offline");

    return mutateAsync({
      method: "POST",
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }

      return res.json();
    });
  };

  const updateTransaction = async (trasaction: UpdateTransactionInput) => {
    if (!guardOnline()) throw new Error("Offline");

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
