import useSWRMutation from "swr/mutation";
import { sendRequest } from "@/config/request";
import { User } from "@/interfaces/user";

const KEY = "/api/user";

export const useMutateUser = () => {
  const { trigger, isMutating } = useSWRMutation(KEY, sendRequest(KEY));

  const updateUser = async (user: User) => {
    return trigger({ method: "PUT", body: JSON.stringify(user) }).then(
      (res) => {
        if (res.status !== 200) {
          return Promise.reject(res.statusText);
        }

        return res.json();
      }
    );
  };

  return {
    isMutating,
    updateUser,
  };
};
