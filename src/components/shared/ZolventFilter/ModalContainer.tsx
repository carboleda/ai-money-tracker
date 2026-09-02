import { Modal } from "@heroui/react";
import { PropsWithChildren } from "react";
import { useZolventFilterContext } from "./ZolventFilter";

const ZolventFilterModalContainer: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isFilterOpen, setIsFilterOpen } = useZolventFilterContext();
  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      >
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Heading>Filters</Modal.Heading>
            <Modal.Body>{children}</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ZolventFilterModalContainer;
