import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import {
  RecurringExpenseConfig,
  RecurringExpenseConfigCreateRequest,
} from "@/interfaces/recurringExpense";

interface TransactionRequest {
  method: "POST" | "DELETE" | "PATCH";
  body: string;
}

const KEY = "/api/recurring-expenses/config";

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

export const useMutateRecurringExpensesConfig = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest);

  const createConfig = async (config: RecurringExpenseConfigCreateRequest) => {
    return trigger({ method: "POST", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          return Promise.reject(res.statusText);
        }

        return res.json();
      }
    );
  };

  const updateConfig = async (config: RecurringExpenseConfig) => {
    return trigger({ method: "PATCH", body: JSON.stringify(config) }).then(
      (res) => {
        if (res.status !== 200) {
          return Promise.reject(res.statusText);
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
