"use client";

import React, { useEffect } from "react";
import { Env } from "@/config/env";
import { User } from "@heroui/user";
import { auth } from "@/firebase/client/auth";

export type User = {
  email?: string;
  name?: string;
  picture?: string;
};

export const UserAvatar: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);

  useEffect(() => {
    if (user) return;

    auth.authStateReady().then(() => {
      const authUser = auth.currentUser;

      setUser({
        name: authUser?.displayName || undefined,
        picture: authUser?.photoURL || undefined,
        email: authUser?.email || undefined,
      });
    });
  }, [user]);

  return (
    <User
      avatarProps={{
        src: Env.isLocal ? undefined : user?.picture,
        fallback: user?.name?.charAt(0) || "U",
        showFallback: true,
        isBordered: true,
        color: "primary",
        className: "w-9 h-9",
      }}
      description={user?.email}
      name={user?.name}
      classNames={{
        wrapper: "!px-0",
      }}
    />
  );
};
