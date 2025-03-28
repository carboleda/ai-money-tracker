import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { PropsWithChildren } from "react";

export enum Action {
  Yes,
  No,
  Cancel,
}

interface ConfirmationModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string | React.ReactNode;
  onAction: (action: Action) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  children,
  onAction,
}) => {
  return (
    <>
      <Modal
        id="confirmation-modal"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={() => onAction(Action.Cancel)}
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>{children}</ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => onAction(Action.No)}
                >
                  No
                </Button>
                <Button color="primary" onPress={() => onAction(Action.Yes)}>
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
