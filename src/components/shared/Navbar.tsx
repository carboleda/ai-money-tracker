"use client";

import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@heroui/react";
import { CiMenuBurger } from "react-icons/ci";
import { HiChevronLeft } from "react-icons/hi";
import { NetworkIndicator } from "@/components/shared/NetworkIndicator";

export const Navbar = () => {
  const { pageTitle, pageSubtitle } = useAppStore();

  return (
    <div className="flex flex-row justify-between items-center w-full gap-2 mb-4">
      <NavbarButton />

      <div className="flex flex-col w-full">
        <h1 className="font-semibold md:text-2xl">{pageTitle}</h1>
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-sm lg:font-normal font-light text-muted">
            {pageSubtitle}
          </h3>
          <NetworkIndicator />
        </div>
      </div>
    </div>
  );
};

const NavbarButton = ({ ...props }: React.ComponentProps<typeof Button>) => {
  const { isBackButtonVisible, toggleSidebar, requestBack } = useAppStore();
  const dynamicProps = {
    "aria-label": isBackButtonVisible ? "Back" : "Menu",
    onPress: isBackButtonVisible ? requestBack : toggleSidebar,
  };

  return (
    <Button
      variant="ghost"
      className="md:hidden rounded-sm p-0"
      {...dynamicProps}
      {...props}
    >
      {isBackButtonVisible ? (
        <HiChevronLeft className="size-6" />
      ) : (
        <CiMenuBurger className="size-6" />
      )}
    </Button>
  );
};
