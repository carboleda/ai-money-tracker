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
import React, { Key } from "react";

interface UserAvatarProps {
  user?: {
    name?: string;
    picture?: string;
  };
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const router = useRouter();

  const onAction = (key: Key) => {
    if (key === "signOut") {
      onSignOut();
    }
  };

  const onSignOut = async () => {
    await signOut(auth);

    await fetch("/api/logout");

    router.push("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Avatar isBordered color="primary" src={user?.picture} />
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
