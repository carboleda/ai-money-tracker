"use client";

import React, { useState } from "react";
import { Button, Popover } from "@heroui/react";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";
import clsx from "clsx";
import { CHIP_REQUIRED_EMPTY_CLASS } from "./chipStyles";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false, loading: () => <div>Loading emojis...</div> },
);

export interface InlineEmojiChipProps {
  icon: string;
  defaultIcon?: string;
  ariaLabel: string;
  isRequired?: boolean;
  onIconChange: (icon: string) => void;
  onInteraction?: () => void;
}

/**
 * Emoji-picker trigger styled as a chip. Used for the Account icon.
 */
export const InlineEmojiChip: React.FC<InlineEmojiChipProps> = ({
  icon,
  defaultIcon = "🏦",
  ariaLabel,
  isRequired = false,
  onIconChange,
  onInteraction = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) onInteraction();
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
      <Button
        isIconOnly
        variant="outline"
        className={clsx(
          "text-2xl p-2 rounded-xl",
          isRequired && !icon && CHIP_REQUIRED_EMPTY_CLASS,
        )}
        aria-label={ariaLabel}
      >
        {icon || defaultIcon}
      </Button>
      <Popover.Content
        placement="bottom"
        className="w-80 bg-transparent! shadow-none! rounded-none!"
      >
        <Popover.Dialog className="p-0! outline-none!">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onIconChange(emojiData.emoji);
              setIsOpen(false);
            }}
            theme={Theme.AUTO}
            width="100%"
            height={400}
            previewConfig={{
              showPreview: false,
            }}
            searchDisabled={false}
            lazyLoadEmojis={true}
          />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};
