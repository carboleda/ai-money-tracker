import React, { PropsWithChildren, useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { HiOutlineSearch } from "react-icons/hi";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export interface SearchToolbarProps extends PropsWithChildren {
  filterValue?: string;
  onSearchChange: (value: string) => void;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  filterValue,
  onSearchChange,
  children,
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const isMobile = useIsMobile();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const onValueChange = (value: string = "") => {
    onSearchChange(value);
  };

  const onClear = () => {
    onSearchChange("");
  };

  const setFocus = () => {
    setIsInputFocused(true);
  };

  const onClickOutside = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
  };

  useEffect(() => {
    setIsInputFocused(isMobile ? false : true);
  }, [isMobile]);

  return (
    <>
      <div
        className="w-fit h-full flex items-center gap-2"
        onBlur={onClickOutside}
      >
        {isMobile && !isInputFocused && (
          <Button
            variant="flat"
            size="md"
            className="w-fit md:w-fit justify-start px-3 rounded-xl"
            onPress={setFocus}
            isIconOnly
          >
            <HiOutlineSearch className="text-lg" />
          </Button>
        )}
        {(isInputFocused || !isMobile) && (
          <Input
            radius="md"
            variant="faded"
            classNames={{ inputWrapper: "py-0" }}
            className="w-fit"
            placeholder={t("searchByDescription")}
            startContent={<HiOutlineSearch />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onValueChange}
            autoFocus={isMobile}
            isClearable
          />
        )}
      </div>
      <div className={!isMobile || !isInputFocused ? "flex gap-2" : "hidden"}>
        {children}
      </div>
    </>
  );
};
