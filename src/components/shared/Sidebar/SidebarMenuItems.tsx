"use client";

import { Key, ReactNode, useEffect, useState } from "react";
import { Page, siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { UserAvatar } from "../../UserAvatar";
import clsx from "clsx";
import { HiBell } from "react-icons/hi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LocaleNamespace } from "@/i18n/namespace";
import { Listbox, ListboxSection, ListboxItem } from "@heroui/listbox";
import { FaCircleArrowRight } from "react-icons/fa6";
import { Chip } from "@heroui/chip";
import { TFunction } from "i18next";

const keyLabel = new Map(
  siteConfig.pages.flatMap((page: any) => {
    if ("groupLabel" in page) {
      return page.pages.map((groupPage: Page) => [
        groupPage.href,
        groupPage.label,
      ]);
    }

    return [[page.href, page.label]];
  })
);

interface SidebarMenuItemsProps {
  onItemClick?: (key: Key) => void;
}

interface IconWrapperProps {
  children: ReactNode;
  className?: string;
}

enum SidebarMenuItemKeys {
  Avatar = "avatar",
  Notifications = "notifications",
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

const renderPageItem = (page: Page, t: TFunction, pathname: string) => {
  return (
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
        page.label === keyLabel.get(pathname) && (
          <Chip variant="light" color="success">
            <FaCircleArrowRight />
          </Chip>
        )
      }
    >
      {t(page.label)}
    </ListboxItem>
  );
};

export const SidebarMenuItems: React.FC<SidebarMenuItemsProps> = ({
  onItemClick,
}) => {
  const pathname = usePathname();
  const { t } = useTranslation(LocaleNamespace.Login);
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
    if (key === SidebarMenuItemKeys.Notifications) {
      setDoNotAskAgain(false);
      location.reload();
    }

    onItemClick?.(key);
  };

  return (
    <Listbox
      className="flex w-full flex-col justify-start items-start"
      aria-label="User Menu"
      selectionMode="none"
      variant="flat"
      color="default"
      onAction={onAction}
      disabledKeys={disabledKeys}
    >
      <ListboxSection showDivider>
        <ListboxItem key={SidebarMenuItemKeys.Avatar} textValue="User Avatar">
          <UserAvatar />
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
        {siteConfig.pages
          .filter((page: any) => "href" in page)
          .map((page) => renderPageItem(page as Page, t, pathname))}
      </ListboxSection>
      <>
        {siteConfig.pages
          .filter((page: any) => "groupLabel" in page)
          .map((page: any) => {
            return (
              <ListboxSection key={page.groupLabel} title={t(page.groupLabel)}>
                {page.pages.map((groupPage: Page) =>
                  renderPageItem(groupPage, t, pathname)
                )}
              </ListboxSection>
            );
          })}
      </>
    </Listbox>
  );
};
