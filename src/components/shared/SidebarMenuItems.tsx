import { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { User, UserAvatar } from "../UserAvatar";
import { Key, useTransition } from "react";
import clsx from "clsx";
import { HiBell } from "react-icons/hi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LocaleNamespace } from "@/i18n/namespace";
import { Listbox, ListboxSection, ListboxItem } from "@heroui/listbox";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client/auth";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";
import { FaCircleArrowRight } from "react-icons/fa6";

const keyLabel = new Map(
  siteConfig.pages.map((page) => [page.href, page.label])
);

interface SidebarMenuItemsProps {
  user?: User;
}

interface IconWrapperProps {
  children: ReactNode;
  className?: string;
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

export const SidebarMenuItems: React.FC<SidebarMenuItemsProps> = ({ user }) => {
  const pathname = usePathname();
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

  return (
    <div className="flex w-full flex-col justify-start items-start">
      <Listbox
        aria-label="User Menu"
        selectionMode="none"
        variant="flat"
        color="default"
        onAction={onAction}
      >
        <ListboxSection showDivider>
          <ListboxItem key="avatar" textValue="User Avatar">
            <UserAvatar user={user} />
          </ListboxItem>
          {doNotAskAgain && (
            <ListboxItem
              key="notifications"
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
          )}
          <ListboxItem
            key="signOut"
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
        </ListboxSection>

        <>
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
        </>
      </Listbox>
    </div>
  );
};
