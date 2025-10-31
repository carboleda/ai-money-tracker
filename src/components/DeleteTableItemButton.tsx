import { Transaction } from "@/interfaces/transaction";
import { Button, ButtonProps } from "@heroui/button";
import { IconCheckCircle, IconDelete } from "./shared/icons";
import { useEffect, useState } from "react";
import { Progress } from "@heroui/progress";

const CONFIRMATION_TIME = 4000;
const CONFIRMATION_TICK = 10;

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
    <div className="w-fit my-0 content-center">
      <Button
        isIconOnly
        color="danger"
        variant="light"
        className="self-center m-0 p-0"
        aria-label="Remove"
        size="sm"
        disabled={isDisabled}
        onPress={onClick}
        {...props}
      >
        {isWaitingConfirmation ? <IconCheckCircle /> : <IconDelete />}
      </Button>
      {isWaitingConfirmation ? <ProgressBar /> : null}
    </div>
  );
};

function ProgressBar() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((value) => value + CONFIRMATION_TICK);
    }, CONFIRMATION_TIME / CONFIRMATION_TICK);

    return () => clearInterval(interval);
  }, []);

  return (
    <Progress size="sm" color="danger" aria-label="Loading..." value={value} />
  );
}
