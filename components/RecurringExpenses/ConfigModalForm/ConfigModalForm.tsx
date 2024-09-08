import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { DatePicker } from "@nextui-org/date-picker";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { RecurringExpenseConfig } from "@/interfaces/recurringExpense";
import { FrequencyDropdown } from "@/components/FrequencyDropdown";

interface ConfigRecurringExpenseModalFormProps {
  item?: RecurringExpenseConfig;
  onDismiss: () => void;
}

export const ConfigRecurringExpenseModalForm: React.FC<
  ConfigRecurringExpenseModalFormProps
> = ({ item, onDismiss }) => {
  const { isOpen, onOpenChange } = useDisclosure({
    isOpen: !!item,
  });

  const onOpenChangeHandler = (_open: boolean) => {
    onOpenChange();
    onDismiss();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChangeHandler}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Config Recurrent Expense
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Deescription"
                  variant="bordered"
                  defaultValue={item?.description}
                />
                <FrequencyDropdown
                  selectedFrequency={item?.frequency}
                  onChange={(a) => console.log(a)}
                />
                <DatePicker
                  label="Due date"
                  variant="bordered"
                  granularity="day"
                  defaultValue={
                    item?.dueDate &&
                    parseAbsoluteToLocal(item?.dueDate?.toISOString())
                  }
                />
                <Input
                  label="Amount"
                  variant="bordered"
                  type="number"
                  defaultValue={item?.amount ? item?.amount.toString() : ""}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
