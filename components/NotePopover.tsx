import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { IconComment } from "./shared/icons";

interface NotePopoverProps {
  content: string;
}

export const NotePopover: React.FC<NotePopoverProps> = ({ content }) => {
  return (
    <Popover showArrow placement="bottom">
      <PopoverTrigger>
        <Button isIconOnly size="sm" aria-label="Notes" className="h-6">
          <IconComment size={15} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-2">
          <div className="font-bold">Notes</div>
          <div className="max-w-48 text-wrap">{content}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
