import { Modal } from "@heroui/react";
import { PropsWithChildren } from "react";
import { useZolventFilterContext } from "./ZolventFilter";
import { useTranslation } from "react-i18next";

const ZolventFilterModalContainer: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { t } = useTranslation();
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
            <Modal.Heading>{t("filters")}</Modal.Heading>
            <Modal.Body>{children}</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ZolventFilterModalContainer;
