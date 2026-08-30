import { Modal } from "@heroui/react";
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
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container placement="top" size="lg">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1">
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
