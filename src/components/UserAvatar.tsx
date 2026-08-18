"use client";

import React from "react";
import { Env } from "@/config/env";
import { User } from "@heroui/user";
import { useAuthUser } from "@/hooks/useAuthUser";

export const UserAvatar: React.FC = () => {
  const user = useAuthUser();

  return (
    <User
      avatarProps={{
        src: Env.isLocal ? undefined : user?.picture,
        fallback: user?.name?.charAt(0) || "U",
        showFallback: true,
        isBordered: true,
        color: "success",
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
