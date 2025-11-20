import { LocaleNamespace } from "@/i18n/namespace";
import { Button } from "@heroui/button";
import { addToast, closeToast, ToastProps } from "@heroui/toast";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

type ToastConfig = Partial<ToastProps>;

type ToastConfirmConfig = ToastConfig & {
  timeout?: number;
  onConfirm: () => void;
};

const DEFAULT_TOAST_CONFIG: Partial<ToastProps> = {
  radius: "lg",
  variant: "bordered",
};

interface UseToastReturn {
  showSuccessToast: (config: ToastConfig) => void;
  showConfirmDeleteToast: (config: ToastConfirmConfig) => void;
}

export const useToast = (): UseToastReturn => {
  const { t } = useTranslation(LocaleNamespace.Common);

  const showSuccessToast = useCallback((config: ToastConfig) => {
    addToast({
      ...DEFAULT_TOAST_CONFIG,
      color: "success",
      ...config,
    });
  }, []);

  const showConfirmDeleteToast = useCallback(
    ({ onConfirm, ...config }: ToastConfirmConfig) => {
      const toastKey = addToast({
        ...config,
        color: "danger",
        variant: "bordered",
        radius: "lg",
        shouldShowTimeoutProgress: true,
        endContent: (
          <Button
            size="sm"
            variant="solid"
            color="danger"
            onPress={() => {
              onConfirm();
              closeToast(toastKey!);
            }}
          >
            {t("delete")}
          </Button>
        ),
      });
    },
    [t]
  );

  return { showSuccessToast, showConfirmDeleteToast };
};
