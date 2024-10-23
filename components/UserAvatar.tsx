"use client";

import { auth } from "@/firebase/client/auth";
import { Avatar } from "@nextui-org/avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { Key, useTransition } from "react";

interface UserAvatarProps {
  user?: {
    name?: string;
    picture?: string;
  };
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const onAction = (key: Key) => {
    if (key === "signOut") {
      onSignOut();
    }
  };

  const onSignOut = async () => {
    await signOut(auth);

    await fetch("/api/logout");

    router.push("/login");

    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Avatar
            className="w-9 h-9"
            color="primary"
            src={user?.picture}
            showFallback
            name={user?.name?.charAt(0)}
            isBordered
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile Actions"
          onAction={onAction}
          disabledKeys={["name"]}
        >
          <DropdownItem key="name">{user?.name}</DropdownItem>
          <DropdownItem key="signOut">Sign Out</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};
