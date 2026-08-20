"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";
import { Button, CloseButton, InputGroup, TextField } from "@heroui/react";
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
    setIsInputFocused(!isMobile);
  }, [isMobile]);

  return (
    <>
      <div
        role="search"
        className="w-fit h-full flex items-center gap-2"
        onBlur={onClickOutside}
      >
        {isMobile && !isInputFocused && (
          <Button
            variant="tertiary"
            className="w-fit md:w-fit justify-start px-3"
            onPress={setFocus}
            isIconOnly
          >
            <HiOutlineSearch className="text-lg" />
          </Button>
        )}
        {(isInputFocused || !isMobile) && (
          <TextField
            className="w-fit"
            value={filterValue}
            onChange={onValueChange}
          >
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <HiOutlineSearch />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder={t("searchByDescription")}
                autoFocus={isMobile}
              />
              {filterValue && (
                <InputGroup.Suffix>
                  <CloseButton aria-label={t("clear")} onPress={onClear} />
                </InputGroup.Suffix>
              )}
            </InputGroup>
          </TextField>
        )}
      </div>
      <div className={!isMobile || !isInputFocused ? "flex gap-2" : "hidden"}>
        {children}
      </div>
    </>
  );
};
