import { Transaction } from "@/interfaces/transaction";
import { Button } from "@nextui-org/button";
import { IconCheckCircle, IconDelete } from "./shared/icons";
import { useEffect, useState } from "react";
import { Progress } from "@nextui-org/progress";

const CONFIRMATION_TIME = 4000;
const CONFIRMATION_TICK = 10;

interface DeleteTransactionButtonProps {
  item: Transaction;
  isDisabled?: boolean;
  deleteTransaction: (id: string) => void;
}

export const DeleteTransactionButton: React.FC<
  DeleteTransactionButtonProps
> = ({ item, isDisabled = false, deleteTransaction }) => {
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
      return deleteTransaction(item.id);
    }

    setIsWaitingConfirmation(true);
  };

  return (
    <div className="w-fit my-0 mx-auto">
      <Button
        isIconOnly
        color="danger"
        variant="light"
        className="self-center"
        aria-label="Remove"
        disabled={isDisabled}
        onClick={onClick}
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
