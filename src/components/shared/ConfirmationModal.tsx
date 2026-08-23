import { Modal, Button } from "@heroui/react";
import { PropsWithChildren } from "react";
import { ModalContainer } from "./ModalContainer";

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
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={() => onAction(Action.Cancel)}
        isDismissable={false}
      >
        <ModalContainer>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading className="flex flex-col gap-1">
                {title}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
              <Button variant="danger-soft" onPress={() => onAction(Action.No)}>
                No
              </Button>
              <Button variant="primary" onPress={() => onAction(Action.Yes)}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
