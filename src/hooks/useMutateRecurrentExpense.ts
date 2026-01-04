import useSWRMutation from "swr/mutation";
import { RecurringExpense } from "@/interfaces/recurringExpense";
import { sendRequest } from "@/config/request";

const KEY = "/api/recurring-expenses";

export const useMutateRecurringExpenses = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest(KEY));

  const createConfig = async (config: Omit<RecurringExpense, "id">) => {
    return trigger({ method: "POST", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const updateConfig = async (config: RecurringExpense) => {
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
