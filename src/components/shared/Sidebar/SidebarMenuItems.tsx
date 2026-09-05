"use client";

import { Key, ReactNode, useEffect, useState } from "react";
import { Page, siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { UserAvatar } from "../../UserAvatar";
import clsx from "clsx";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LocaleNamespace } from "@/i18n/namespace";
import { ListBox, Label, Header, Separator } from "@heroui/react";
import { FaCircleArrowRight } from "react-icons/fa6";
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
  collapsed?: boolean;
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
      "flex items-center rounded-sm justify-center w-7 h-7"
    )}
  >
    {children}
  </div>
);

const renderPageItem = (
  page: Page,
  t: TFunction,
  pathname: string,
  collapsed?: boolean
) => {
  return (
    <ListBox.Item
      key={page.label}
      id={page.label}
      href={page.href}
      textValue={page.label}
      className={clsx(collapsed && "md:justify-center md:gap-0 md:pe-2")}
    >
      <IconWrapper className={page.className}>
        <page.icon className="text-lg md:text-base" />
      </IconWrapper>
      <Label
        className={clsx(
          "overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "md:max-w-0 md:opacity-0" : "md:max-w-40 md:opacity-100"
        )}
      >
        {t(page.label)}
      </Label>
      <ListBox.ItemIndicator>
        {() =>
          page.label === keyLabel.get(pathname) ? (
            <FaCircleArrowRight
              className={clsx("size-4 text-accent", collapsed && "md:hidden")}
            />
          ) : null
        }
      </ListBox.ItemIndicator>
    </ListBox.Item>
  );
};

export const SidebarMenuItems: React.FC<SidebarMenuItemsProps> = ({
  onItemClick,
  collapsed,
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
    <ListBox
      className={clsx(
        "flex w-full flex-col justify-start items-start",
        collapsed && "md:items-center"
      )}
      aria-label="User Menu"
      selectionMode="none"
      variant="default"
      onAction={onAction}
      disabledKeys={disabledKeys}
    >
      <ListBox.Section className="w-full">
        <ListBox.Item
          key={SidebarMenuItemKeys.Avatar}
          id={SidebarMenuItemKeys.Avatar}
          textValue="User Avatar"
          className={clsx(collapsed && "md:justify-center")}
        >
          <UserAvatar collapsed={collapsed} />
        </ListBox.Item>
        {/* <ListBox.Item
          key={SidebarMenuItemKeys.Notifications}
          id={SidebarMenuItemKeys.Notifications}
          textValue={t("enablePushNotifications")}
        >
          <IconWrapper className="bg-success/10 text-success">
            <HiBell className="text-lg md:text-base" />
          </IconWrapper>
          <Typography type="body-xs">{t("enablePushNotifications")}</Typography>
        </ListBox.Item> */}
      </ListBox.Section>
      <Separator />
      <ListBox.Section className="w-full">
        {siteConfig.pages
          .filter((page: any) => "href" in page)
          .map((page) => renderPageItem(page as Page, t, pathname, collapsed))}
      </ListBox.Section>
      <Separator />
      {siteConfig.pages
        .filter((page: any) => "groupLabel" in page)
        .map((page: any) => {
          return (
            <ListBox.Section className="w-full" key={page.groupLabel}>
              <Header
                className={clsx(
                  "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  collapsed ? "md:max-h-0 md:opacity-0" : "md:max-h-10 md:opacity-100"
                )}
              >
                {t(page.groupLabel)}
              </Header>
              {page.pages.map((groupPage: Page) =>
                renderPageItem(groupPage, t, pathname, collapsed),
              )}
            </ListBox.Section>
          );
        })}
    </ListBox>
  );
};
