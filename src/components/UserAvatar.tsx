"use client";

import React from "react";
import { Env } from "@/config/env";
import { Avatar } from "@heroui/react";
import { useAuthUser } from "@/hooks/useAuthUser";
import clsx from "clsx";

interface UserAvatarProps {
  collapsed?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ collapsed }) => {
  const user = useAuthUser();
  const src = Env.isLocal ? undefined : user?.picture;
  const initials = user?.name?.charAt(0) || "U";

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-sm",
        collapsed && "md:justify-center md:gap-0"
      )}
    >
      <Avatar className="w-9 h-9 ring-2 ring-background">
        {src && <Avatar.Image src={src} alt={user?.name ?? "User"} />}
        <Avatar.Fallback className="bg-success/20 text-success">
          {initials}
        </Avatar.Fallback>
      </Avatar>
      <div
        className={clsx(
          "flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "md:max-w-0 md:opacity-0" : "md:max-w-40 md:opacity-100"
        )}
      >
        <span className="text-sm truncate">{user?.name}</span>
        <span className="text-xs text-muted truncate">{user?.email}</span>
      </div>
    </div>
  );
};
