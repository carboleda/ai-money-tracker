"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/app-shell-sw.js")
      .catch((error) =>
        console.warn("[ServiceWorkerRegistrar] Registration failed:", error)
      );
  }, []);

  return null;
}
