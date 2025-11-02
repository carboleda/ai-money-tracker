import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { FaCommentDollar } from "react-icons/fa6";
import { Divider } from "@heroui/divider";

interface NotePopoverProps {
  content: string;
}

export const NotePopover: React.FC<NotePopoverProps> = ({ content }) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);

  return (
    <Popover
      showArrow
      placement="bottom"
      backdrop="opaque"
      classNames={{
        base: [
          // arrow color
          "before:bg-default-200",
        ],
        content: "px-3 py-2 border border-default-200",
      }}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          aria-label="Notes"
          className="h-6"
        >
          <FaCommentDollar className="text-lg md:text-xl" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="min-w-32">
          <div className="font-semibold select-none">{t("notes")}</div>
          <Divider className="my-2" />
          <div className="max-w-48 text-wrap font-light">{content}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
