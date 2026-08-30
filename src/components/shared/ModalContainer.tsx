import { useIsMobile } from "@/hooks/useIsMobile";
import { Modal, ModalContainerProps } from "@heroui/react";

export const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  ...rest
}) => {
  const isMobile = useIsMobile();

  return (
    <Modal.Container
      placement={isMobile ? "bottom" : "center"}
      className={isMobile ? "p-0 sm:p-0" : undefined}
      {...rest}
    >
      {children}
    </Modal.Container>
  );
};
