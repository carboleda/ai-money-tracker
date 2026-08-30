"use client";

import type { ToastContentValue } from "@heroui/react";

import {
  Button,
  toast,
  Toast,
  ToastContent,
  ToastDescription,
  ToastIndicator,
  toastQueue,
  ToastTitle,
} from "@heroui/react";

export function CustomToastProvider() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Toast.Provider placement="bottom" queue={toastQueue}>
        {({ toast: toastItem }) => {
          const content = toastItem.content as ToastContentValue;

          return (
            <Toast
              className="rounded-xl border border-border/80 bg-surface shadow-lg ring-1 ring-black/5 dark:ring-white/10"
              toast={toastItem}
              variant={content.variant}
            >
              <ToastContent className="flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  {content.indicator && (
                    <ToastIndicator variant={content.variant}>
                      {content.indicator}
                    </ToastIndicator>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {content.title ? (
                      <ToastTitle>{content.title}</ToastTitle>
                    ) : null}
                    {content.description ? (
                      <ToastDescription>{content.description}</ToastDescription>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2 w-full justify-end">
                  <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() => toast.close(toastItem.key)}
                  >
                    Close
                  </Button>
                  {content.actionProps && (
                    <Button size="sm" {...content.actionProps} />
                  )}
                </div>
              </ToastContent>
            </Toast>
          );
        }}
      </Toast.Provider>
    </div>
  );
}
