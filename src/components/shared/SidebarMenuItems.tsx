"use client";

import { Key, ReactNode, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { User, UserAvatar } from "../UserAvatar";
import { useTransition } from "react";
import clsx from "clsx";
import { HiBell } from "react-icons/hi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LocaleNamespace } from "@/i18n/namespace";
import { Listbox, ListboxSection, ListboxItem } from "@heroui/listbox";
import { signOut } from "firebase/auth";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";
import { FaCircleArrowRight } from "react-icons/fa6";

const keyLabel = new Map(
  siteConfig.pages.map((page) => [page.href, page.label])
);

interface SidebarMenuItemsProps {
  user?: User;
  onItemClick?: (key: Key) => void;
}

interface IconWrapperProps {
  children: ReactNode;
  className?: string;
}

enum SidebarMenuItemKeys {
  Avatar = "avatar",
  Notifications = "notifications",
  SignOut = "signOut",
}

export const IconWrapper = ({ children, className }: IconWrapperProps) => (
  <div
    className={clsx(
      className,
      "flex items-center rounded-small justify-center w-7 h-7"
    )}
  >
    {children}
  </div>
);

export const SidebarMenuItems: React.FC<SidebarMenuItemsProps> = ({
  user,
  onItemClick,
}) => {
  const pathname = usePathname();
  const { t } = useTranslation(LocaleNamespace.Login);
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const [doNotAskAgain, setDoNotAskAgain] = useLocalStorage(
    "doNotAskAgain",
    false
  );
  const [disabledKeys, setDisabledKeys] = useState<Array<string>>([]);

  useEffect(() => {
    setDisabledKeys((prev) => {
      if (doNotAskAgain) {
        return [...prev].filter(
          (key) => key !== SidebarMenuItemKeys.Notifications
        );
      }
      return [...prev, SidebarMenuItemKeys.Notifications];
    });
  }, [doNotAskAgain]);

  const onAction = (key: Key) => {
    if (key === SidebarMenuItemKeys.SignOut) {
      onSignOut();
    } else if (key === SidebarMenuItemKeys.Notifications) {
      setDoNotAskAgain(false);
      location.reload();
    }

    onItemClick?.(key);
  };

  const onSignOut = async () => {
    const { auth } = await import("@/firebase/client/auth");
    await signOut(auth);

    await fetch("/api/logout");

    router.push("/login");

    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  };

  return (
    <div className="flex w-full flex-col justify-start items-start">
      <Listbox
        aria-label="User Menu"
        selectionMode="none"
        variant="flat"
        color="default"
        onAction={onAction}
        disabledKeys={disabledKeys}
      >
        <ListboxSection showDivider>
          <ListboxItem key={SidebarMenuItemKeys.Avatar} textValue="User Avatar">
            <UserAvatar user={user} />
          </ListboxItem>
          <ListboxItem
            key={SidebarMenuItemKeys.Notifications}
            textValue={t("enablePushNotifications")}
            title={t("enablePushNotifications")}
            startContent={
              <IconWrapper className="bg-success/10 text-success">
                <HiBell className="text-lg md:text-medium" />
              </IconWrapper>
            }
          >
            {t("enablePushNotifications")}
          </ListboxItem>
        </ListboxSection>
        <ListboxSection showDivider>
          {siteConfig.pages.map((page) => (
            <ListboxItem
              key={page.label}
              href={page.href}
              textValue={page.label}
              title={t(page.label)}
              startContent={
                <IconWrapper className={page.className}>
                  <page.icon className="text-lg md:text-medium" />
                </IconWrapper>
              }
              endContent={
                page.label === keyLabel.get(pathname) && <FaCircleArrowRight />
              }
            >
              {t(page.label)}
            </ListboxItem>
          ))}
        </ListboxSection>
        <ListboxItem
          key={SidebarMenuItemKeys.SignOut}
          textValue={t("signOut")}
          title={t("signOut")}
          startContent={
            <IconWrapper className="bg-danger/10 text-danger">
              <HiArrowRightEndOnRectangle className=" text-lg md:text-medium" />
            </IconWrapper>
          }
        >
          {t("signOut")}
        </ListboxItem>
      </Listbox>
    </div>
  );
};
