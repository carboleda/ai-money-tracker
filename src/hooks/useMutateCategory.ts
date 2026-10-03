import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateCategoryInput } from "@/app/api/domain/category/ports/inbound/update-category.port";
import type { CustomizeCategoryInput } from "@/app/api/domain/category/ports/inbound/customize-category.port";
import {
  sendRequest,
  invalidateResource,
  MutationRequest,
} from "@/config/request";
import { useOfflineWriteGuard } from "@/hooks/useOnlineStatus";

const CATEGORY_KEY = "/api/category";
const CATEGORY_WITH_BUDGET_KEY = "/api/category/with-budget";
const CUSTOMIZE_URL = "/api/category/customize";

export const useMutateCategory = () => {
  const queryClient = useQueryClient();
  const guardOnline = useOfflineWriteGuard();

  const invalidate = () =>
    invalidateResource(queryClient, [CATEGORY_KEY, CATEGORY_WITH_BUDGET_KEY]);

  const { mutateAsync: updateMutateAsync, isPending: isUpdating } =
    useMutation({
      mutationFn: (request: MutationRequest) =>
        sendRequest(CATEGORY_KEY, request),
      onSuccess: invalidate,
    });

  const { mutateAsync: customizeMutateAsync, isPending: isCustomizing } =
    useMutation({
      mutationFn: (request: MutationRequest) =>
        sendRequest(CUSTOMIZE_URL, request),
      onSuccess: invalidate,
    });

  const updateConfig = async (config: UpdateCategoryInput) => {
    if (!guardOnline()) throw new Error("Offline");

    const res = await updateMutateAsync({
      method: "PUT",
      body: JSON.stringify(config),
    });

    if (res.status !== 200) {
      throw new Error(res.statusText);
    }

    return res.json();
  };

  const customizeConfig = async (config: CustomizeCategoryInput) => {
    if (!guardOnline()) throw new Error("Offline");

    const res = await customizeMutateAsync({
      method: "POST",
      body: JSON.stringify(config),
    });

    if (res.status !== 201) {
      throw new Error(res.statusText);
    }

    return res.json();
  };

  return {
    isMutating: isUpdating || isCustomizing,
    updateConfig,
    customizeConfig,
  };
};
