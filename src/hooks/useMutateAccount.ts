import useSWRMutation from "swr/mutation";
import { Account } from "@/interfaces/account";
import { sendRequest } from "@/config/request";

const KEY = "/api/account";

export const useMutateAccount = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest(KEY));

  const createAccount = async (account: Omit<Account, "id">) => {
    return trigger({ method: "POST", body: JSON.stringify(account) }).then(
      (res: any) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const updateAccount = async (account: Account) => {
    return trigger({ method: "PUT", body: JSON.stringify(account) }).then(
      (res: any) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  const deleteAccount = (id: string) => {
    return trigger({ method: "DELETE", body: id });
  };

  return {
    isMutating,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
