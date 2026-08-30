import { Button, Popover, Separator } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { FaCommentDollar } from "react-icons/fa6";

interface NotePopoverProps {
  content: string;
}

export const NotePopover: React.FC<NotePopoverProps> = ({ content }) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);

  return (
    <Popover>
      <Button
        isIconOnly
        variant="tertiary"
        size="sm"
        aria-label="Notes"
        className="h-6"
      >
        <FaCommentDollar className="text-lg md:text-xl" />
      </Button>
      <Popover.Content placement="bottom" className="px-3 py-2">
        <Popover.Dialog>
          <Popover.Arrow />
          <div className="min-w-32">
            <div className="font-semibold select-none">{t("notes")}</div>
            <Separator className="my-2" />
            <div className="max-w-48 text-wrap font-light">{content}</div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};
