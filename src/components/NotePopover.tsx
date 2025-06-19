import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { IconComment } from "./shared/icons";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

interface NotePopoverProps {
  content: string;
}

export const NotePopover: React.FC<NotePopoverProps> = ({ content }) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);

  return (
    <Popover showArrow placement="bottom">
      <PopoverTrigger>
        <Button isIconOnly size="sm" aria-label="Notes" className="h-6">
          <IconComment size={15} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-2">
          <div className="font-bold">{t("notes")}</div>
          <div className="max-w-48 text-wrap">{content}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
