import { siteConfig } from "@/config/site";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { Tabs, Tab, TabsProps, TabItemProps } from "@heroui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { User, UserAvatar } from "../UserAvatar";
import { ReactElement, useTransition } from "react";
import clsx from "clsx";
import { HiBell } from "react-icons/hi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LocaleNamespace } from "@/i18n/namespace";
import { Divider } from "@heroui/divider";

const keyLabel = new Map(
  siteConfig.pages.map((page) => [page.href, page.label])
);

interface SidebarMenuItemsProps {
  user?: User;
}
function renderCustomTab({ key, ...props }: TabItemProps): ReactElement {
  return (
    <Tab
      {...props}
      key={key}
      className={clsx(
        "h-fit w-full flex !flex-col !justify-start !items-start",
        props.className
      )}
    />
  );
}

export const SidebarMenuItems: React.FC<SidebarMenuItemsProps> = ({ user }) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { t } = useTranslation(LocaleNamespace.Login);
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const [doNotAskAgain, setDoNotAskAgain] = useLocalStorage(
    "doNotAskAgain",
    false
  );

  return (
    <div className="flex w-full flex-col justify-start items-start">
      <Tabs
        aria-label="Menu"
        variant="light"
        isVertical
        color="primary"
        size={isMobile ? "sm" : "md"}
        fullWidth={isMobile}
        selectedKey={keyLabel.get(pathname)}
        classNames={{
          base: "w-full",
          tabWrapper: "w-full",
          tabList: "w-full",
        }}
      >
        {renderCustomTab({
          key: "userAvatar",
          href: "#",
          children: <UserAvatar user={user} />,
        })}
        {doNotAskAgain &&
          renderCustomTab({
            key: "notifications",
            id: "notifications",
            href: "#",
            title: (
              <div className="flex !flex-row !items-center !space-x-2 !gap-2">
                <HiBell className="dark:text-white size-8 md:size-6" />
                <span className="text-left w-full">
                  {t("enablePushNotifications")}
                </span>
              </div>
            ),
          })}
        {siteConfig.pages.map((page) =>
          renderCustomTab({
            key: page.label,
            id: page.href,
            href: page.href,
            title: (
              <div className="flex !flex-row !items-center !space-x-2 !gap-2">
                <page.icon className="dark:text-white size-8 md:size-6" />
                <span className="text-left w-full">{t(page.label)}</span>
              </div>
            ),
          })
        )}
      </Tabs>
    </div>
  );
};
