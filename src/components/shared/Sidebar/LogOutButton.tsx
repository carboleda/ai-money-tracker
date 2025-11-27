import { signOut } from "firebase/auth";
import { IconWrapper } from "./SidebarMenuItems";
import { HiArrowRightEndOnRectangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { Button } from "@heroui/button";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

export const LogOutButton: React.FC = () => {
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
      className="flex flex-row gap-3 items-center justify-start p-2"
      variant="light"
      fullWidth
      onPress={onSignOut}
    >
      <IconWrapper className="bg-danger/10 text-danger">
        <HiArrowRightEndOnRectangle className=" text-lg md:text-medium" />
      </IconWrapper>
      <span className="text-small font-normal">{t("signOut")}</span>
    </Button>
  );
};
