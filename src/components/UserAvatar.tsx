"use client";

import { Env } from "@/config/env";
import { User } from "@heroui/user";
import React from "react";

export type User = {
  email?: string;
  name?: string;
  picture?: string;
};

interface UserAvatarProps {
  user?: User;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
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
