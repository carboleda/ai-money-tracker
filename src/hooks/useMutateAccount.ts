import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Account } from "@/interfaces/account";
import { sendRequest, invalidateResource, MutationRequest } from "@/config/request";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/account";
const dependentQueries = [KEY, "/api/summary"];

export const useMutateAccount = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: MutationRequest) => sendRequest(KEY, request),
    onSuccess: () => invalidateResource(queryClient, dependentQueries),
  });

  const createAccount = async (account: Omit<Account, "id">) => {
    if (!guardOnline()) throw new Error("Offline");

    return mutateAsync({ method: "POST", body: JSON.stringify(account) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const updateAccount = async (account: Account) => {
    if (!guardOnline()) throw new Error("Offline");

    return mutateAsync({ method: "PUT", body: JSON.stringify(account) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const deleteAccount = (id: string) => {
    if (!guardOnline()) return Promise.resolve();

    return mutateAsync({ method: "DELETE", body: id });
  };

  return {
    isMutating: isPending,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
