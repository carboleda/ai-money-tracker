"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client/auth";
import { useAuthUserStore } from "@/stores/useAuthUserStore";

// Subscribes to Firebase auth state exactly once, at the app root, so the
// resolved user is already warm in useAuthUserStore by the time any layout
// further down the tree mounts or remounts during navigation.
export function AuthUserInfoProvider() {
  useEffect(() => {
    const { setUser } = useAuthUserStore.getState();

    return onAuthStateChanged(auth, (authUser) => {
      setUser(
        authUser
          ? {
              name: authUser.displayName || undefined,
              picture: authUser.photoURL || undefined,
              email: authUser.email || undefined,
            }
          : null,
      );
    });
  }, []);

  return null;
}
