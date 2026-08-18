import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendRequest, invalidateResource, MutationRequest } from "@/config/request";
import { User } from "@/interfaces/user";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/user";

export const useMutateUser = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (request: MutationRequest) => sendRequest(KEY, request),
    onSuccess: () => invalidateResource(queryClient, KEY),
  });

  const updateUser = async (user: User) => {
    if (!guardOnline()) throw new Error("Offline");

    return mutateAsync({ method: "PUT", body: JSON.stringify(user) }).then(
      (res) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        return res.json();
      }
    );
  };

  return {
    isMutating: isPending,
    updateUser,
  };
};
