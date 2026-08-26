"use client";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Popover } from "react-aria-components";
import { IconChevronDown, Label } from "@heroui/react";
import { selectVariants, listboxVariants, listboxItemVariants } from "@heroui/styles";
import clsx from "clsx";

export interface CustomDropdownProps {
  values: { key: string; label: string }[];
  label?: string;
  value?: string;
  isRequired?: boolean;
  allowEmptySelection?: boolean;
  showLabel?: boolean;
  className?: string;
  onChange: (selectedKey?: string) => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  values,
  label = "Bank Account",
  value,
  isRequired = false,
  showLabel = false,
  allowEmptySelection = false,
  className,
  onChange,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(value ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const triggerId = useId();
  const listboxId = useId();

  useEffect(() => {
    setSelectedKey(value ?? null);
  }, [value]);

  useEffect(() => {
    if (isOpen && focusedKey) {
      itemRefs.current.get(focusedKey)?.focus();
    }
  }, [isOpen, focusedKey]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const closeAndFocusTrigger = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggleOpen = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      setFocusedKey(selectedKey ?? values[0]?.key ?? null);
      setIsOpen(true);
    }
  }, [isOpen, selectedKey, values, closeMenu]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || listboxRef.current?.contains(target)) {
        return;
      }
      closeMenu();
    };

    document.addEventListener("pointerdown", onPointerDownOutside, true);
    return () => document.removeEventListener("pointerdown", onPointerDownOutside, true);
  }, [isOpen, closeMenu]);

  const selectItem = useCallback(
    (key: string) => {
      if (allowEmptySelection && key === selectedKey) {
        setSelectedKey(null);
        onChange(undefined);
      } else {
        setSelectedKey(key);
        onChange(key);
      }
    },
    [allowEmptySelection, selectedKey, onChange],
  );

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = values.findIndex((v) => v.key === focusedKey);
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), values.length - 1);
      setFocusedKey(values[nextIndex]?.key ?? null);
    },
    [values, focusedKey],
  );

  const focusEdge = useCallback(
    (edge: "start" | "end") => {
      const nextKey = edge === "start" ? values[0]?.key : values.at(-1)?.key;
      if (nextKey) setFocusedKey(nextKey);
    },
    [values],
  );

  const onListboxKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveFocus(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveFocus(-1);
          break;
        case "Home":
          e.preventDefault();
          focusEdge("start");
          break;
        case "End":
          e.preventDefault();
          focusEdge("end");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedKey) {
            selectItem(focusedKey);
            closeAndFocusTrigger();
          }
          break;
        case "Escape":
          e.preventDefault();
          closeAndFocusTrigger();
          break;
        default:
          break;
      }
    },
    [moveFocus, focusEdge, focusedKey, selectItem, closeAndFocusTrigger],
  );

  const onListboxBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        closeMenu();
      }
    },
    [closeMenu],
  );

  const slots = useMemo(() => selectVariants({ variant: "secondary" }), []);
  const itemSlots = useMemo(() => listboxItemVariants(), []);
  const selectedItem = useMemo(
    () => values.find((v) => v.key === selectedKey) ?? null,
    [values, selectedKey],
  );

  return (
    <div className={clsx(slots.base(), className)}>
      <Label htmlFor={triggerId} className={clsx({ "sr-only": !showLabel })}>
        {label}
      </Label>
      <Button
        ref={triggerRef}
        id={triggerId}
        className={slots.trigger()}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-required={isRequired || undefined}
        onPress={toggleOpen}
      >
        <span className={slots.value()} data-placeholder={!selectedItem || undefined}>
          {selectedItem?.label ?? label}
        </span>
        <IconChevronDown className={slots.indicator()} data-open={isOpen ? "true" : undefined} />
      </Button>

      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isNonModal
        triggerRef={triggerRef}
        placement="bottom"
        className={slots.popover()}
      >
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          tabIndex={0}
          className={listboxVariants()}
          onKeyDown={onListboxKeyDown}
          onBlur={onListboxBlur}
        >
          {values.map(({ key, label: itemLabel }) => {
            const isSelected = key === selectedKey;
            return (
              <div
                key={key}
                ref={(el) => {
                  if (el) itemRefs.current.set(key, el);
                  else itemRefs.current.delete(key);
                }}
                role="option"
                id={`${listboxId}-${key}`}
                aria-selected={isSelected}
                tabIndex={key === focusedKey ? 0 : -1}
                className={itemSlots.item()}
                onClick={() => {
                  selectItem(key);
                  closeAndFocusTrigger();
                }}
                onMouseEnter={() => setFocusedKey(key)}
                // Fixes warning Visible, non-interactive elements with click handlers must have at least one keyboard listener.
                onKeyUp={() => {}}
              >
                {itemLabel}
                <span
                  aria-hidden="true"
                  data-slot="list-box-item-indicator"
                  data-visible={isSelected || undefined}
                  className={itemSlots.indicator()}
                >
                  <svg
                    aria-hidden="true"
                    data-slot="list-box-item-indicator--checkmark"
                    fill="none"
                    role="presentation"
                    stroke="currentColor"
                    strokeDasharray={22}
                    strokeDashoffset={isSelected ? 44 : 66}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 17 18"
                  >
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </span>
              </div>
            );
          })}
        </div>
      </Popover>
    </div>
  );
};
