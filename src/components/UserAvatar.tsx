"use client";

import { Env } from "@/config/env";
import { auth } from "@/firebase/client/auth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LocaleNamespace } from "@/i18n/namespace";
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
import { useTranslation } from "react-i18next";
import { HiBell } from "react-icons/hi";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";

interface UserAvatarProps {
  user?: {
    name?: string;
    picture?: string;
  };
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const { t } = useTranslation(LocaleNamespace.Login);
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const [doNotAskAgain, setDoNotAskAgain] = useLocalStorage(
    "doNotAskAgain",
    false
  );

  const onAction = (key: Key) => {
    if (key === "signOut") {
      onSignOut();
    } else if (key === "notifications") {
      setDoNotAskAgain(false);
      location.reload();
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
      <Dropdown showArrow={true}>
        <DropdownTrigger>
          <Avatar
            className="w-9 h-9"
            color="primary"
            src={Env.isDev ? undefined : user?.picture}
            name={user?.name?.charAt(0)}
            showFallback
            isBordered
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile Actions"
          onAction={onAction}
          disabledKeys={["name"]}
        >
          <DropdownItem key="name">{user?.name}</DropdownItem>
          {doNotAskAgain && (
            <DropdownItem key="notifications" startContent={<HiBell />}>
              {t("enablePushNotifications")}
            </DropdownItem>
          )}
          <DropdownItem
            key="signOut"
            startContent={<HiArrowRightEndOnRectangle />}
          >
            Sign Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};
