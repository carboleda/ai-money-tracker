import useSWRMutation from "swr/mutation";
import type { CreateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/create-recurring-expense.port";
import type { UpdateRecurringExpenseInput } from "@/app/api/domain/recurring-expense/ports/inbound/update-recurring-expense.port";
import { sendRequest } from "@/config/request";

const KEY = "/api/recurring-expenses";

export const useMutateRecurringExpenses = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest(KEY));

  const createConfig = async (config: CreateRecurringExpenseInput) => {
    return trigger({ method: "POST", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const updateConfig = async (config: UpdateRecurringExpenseInput) => {
    return trigger({ method: "PUT", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const deleteConfig = (id: string) => {
    return trigger({ method: "DELETE", body: id });
  };

  return {
    isMutating,
    createConfig,
    updateConfig,
    deleteConfig,
  };
};
