"use client";

import { useEffect } from "react";
import { useOnlineStore } from "@/stores/useOnlineStore";

// Registers the online/offline listeners exactly once, at the app root, so
// isOnline is tracked independently of any page or component remounting
// during navigation — every consumer reads the same store instead of each
// maintaining its own local state (see useOnlineStatus).
export function OnlineStatusListener() {
  useEffect(() => {
    const { setIsOnline } = useOnlineStore.getState();
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // navigator.onLine/the browser events only reflect whether a network
    // interface is up, not whether requests actually succeed (e.g. LAN
    // connected, no upstream internet — 'offline' never fires). The service
    // worker (app-shell-sw.js) knows the real outcome of every request it
    // intercepts and broadcasts it here, which is what actually determines
    // whether a navigation serves live or cached content.
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "network-status") {
        setIsOnline(event.data.isOnline);
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
