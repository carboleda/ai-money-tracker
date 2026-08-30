"use client";

import React from "react";
import { Env } from "@/config/env";
import { Avatar } from "@heroui/react";
import { useAuthUser } from "@/hooks/useAuthUser";

export const UserAvatar: React.FC = () => {
  const user = useAuthUser();
  const src = Env.isLocal ? undefined : user?.picture;
  const initials = user?.name?.charAt(0) || "U";

  return (
    <div className="inline-flex items-center gap-2 rounded-sm">
      <Avatar className="w-9 h-9 ring-2 ring-background">
        {src && <Avatar.Image src={src} alt={user?.name ?? "User"} />}
        <Avatar.Fallback className="bg-success/20 text-success">
          {initials}
        </Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm">{user?.name}</span>
        <span className="text-xs text-muted">{user?.email}</span>
      </div>
    </div>
  );
};
