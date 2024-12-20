import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { PropsWithChildren } from "react";

interface ChartDetailsModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
}

export const ChartDetailsModal: React.FC<ChartDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <>
      <Modal
        id="cart-details-modal"
        backdrop="blur"
        placement="top"
        size="2xl"
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>{children}</ModalBody>
              <ModalFooter></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
