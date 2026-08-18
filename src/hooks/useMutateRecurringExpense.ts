import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/create-recurring-expense.port";
import type { UpdateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/update-recurring-expense.port";
import { sendRequest, invalidateResource, MutationRequest } from "@/config/request";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/recurring-expenses";

export const useMutateRecurringExpenses = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: MutationRequest) => sendRequest(KEY, request),
    onSuccess: () => invalidateResource(queryClient, KEY),
  });

  const createConfig = async (config: CreateRecurringExpenseInput) => {
    if (!guardOnline()) throw new Error("Offline");

    return mutateAsync({ method: "POST", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const updateConfig = async (config: UpdateRecurringExpenseInput) => {
    if (!guardOnline()) throw new Error("Offline");

    return mutateAsync({ method: "PUT", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const deleteConfig = (id: string) => {
    if (!guardOnline()) return Promise.resolve();

    return mutateAsync({ method: "DELETE", body: id });
  };

  return {
    isMutating: isPending,
    createConfig,
    updateConfig,
    deleteConfig,
  };
};
