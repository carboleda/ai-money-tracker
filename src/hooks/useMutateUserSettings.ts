import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendRequest, invalidateResource } from "@/config/request";
import { UserSettings } from "@/interfaces/user";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const KEY = "/api/user/settings";
const USER_KEY = "/api/user";

type UpdateUserSettingsPayload = {
  [K in keyof UserSettings]?: UserSettings[K] | null;
};

export const useMutateUserSettings = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (settings: UpdateUserSettingsPayload) =>
      sendRequest(KEY, {
        method: "PATCH",
        body: JSON.stringify(settings),
      }),
    onSuccess: () => invalidateResource(queryClient, [KEY, USER_KEY]),
  });

  const updateSettings = async (settings: UpdateUserSettingsPayload) => {
    if (!guardOnline()) throw new Error("Offline");

    const res = await mutateAsync(settings);
    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  };

  return {
    isMutating: isPending,
    updateSettings,
  };
};
