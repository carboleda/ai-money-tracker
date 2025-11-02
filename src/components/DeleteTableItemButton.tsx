import { Button, ButtonProps } from "@heroui/button";
import { useEffect, useState } from "react";
import { FaCircleCheck, FaRegCircleXmark } from "react-icons/fa6";

const CONFIRMATION_TIME = 4000;

interface DeleteTableItemButtonProps extends ButtonProps {
  itemId: string;
  isDisabled?: boolean;
  deleteTableItem: (id: string) => void;
}

export const DeleteTableItemButton: React.FC<DeleteTableItemButtonProps> = ({
  itemId,
  isDisabled = false,
  deleteTableItem,
  ...props
}) => {
  const [isWaitingConfirmation, setIsWaitingConfirmation] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setIsWaitingConfirmation(false),
      CONFIRMATION_TIME
    );
    return () => clearTimeout(timeoutId);
  }, [isWaitingConfirmation]);

  const onClick = () => {
    if (isWaitingConfirmation) {
      return deleteTableItem(itemId);
    }

    setIsWaitingConfirmation(true);
  };

  return (
    <Button
      isIconOnly
      color="danger"
      variant="light"
      className="self-center"
      aria-label="Remove"
      size="sm"
      disabled={isDisabled}
      onPress={onClick}
      {...props}
    >
      {isWaitingConfirmation ? (
        <span className="relative flex">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"></span>
          <FaCircleCheck className="text-xl" />
        </span>
      ) : (
        <FaRegCircleXmark className="text-xl" />
      )}
    </Button>
  );
};
