import { signOut } from "firebase/auth";
import { IconWrapper } from "./SidebarMenuItems";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { Button } from "@heroui/react";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface LogOutButtonProps {
  collapsed?: boolean;
}

export const LogOutButton: React.FC<LogOutButtonProps> = ({ collapsed }) => {
  const { t } = useTranslation(LocaleNamespace.Login);
  const router = useRouter();

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
    <Button
      className={clsx(
        "flex flex-row gap-3 items-center p-2",
        collapsed ? "md:justify-center md:gap-0" : "justify-start"
      )}
      variant="ghost"
      fullWidth
      aria-label={t("signOut")}
      onPress={onSignOut}
    >
      <IconWrapper className="bg-danger/10 text-danger">
        <HiArrowRightEndOnRectangle className=" text-lg md:text-base" />
      </IconWrapper>
      <span
        className={clsx(
          "text-sm font-normal overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "md:max-w-0 md:opacity-0" : "md:max-w-40 md:opacity-100"
        )}
      >
        {t("signOut")}
      </span>
    </Button>
  );
};
