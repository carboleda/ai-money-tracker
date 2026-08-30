import { Modal, Button, Checkbox } from "@heroui/react";
import { PropsWithChildren, useState } from "react";
import { ModalContainer } from "./ModalContainer";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export enum Action {
  Yes,
  No,
  Cancel,
}

interface ConfirmationModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string | React.ReactNode;
  onAction: (action: Action, doNotAskAgainChecked: boolean) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  children,
  onAction,
}) => {
  const { t } = useTranslation(LocaleNamespace.Common);
  const [doNotAskAgainChecked, setDoNotAskAgainChecked] = useState(false);

  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={() => onAction(Action.Cancel, doNotAskAgainChecked)}
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
              <div className="flex flex-row w-full justify-between items-center">
                <Checkbox
                  id="do-not-ask-again"
                  variant="secondary"
                  isSelected={doNotAskAgainChecked}
                  onChange={setDoNotAskAgainChecked}
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    {t("doNotAskAgain")}
                  </Checkbox.Content>
                </Checkbox>
                <div className="flex gap-2">
                  <Button
                    variant="tertiary"
                    onPress={() => onAction(Action.No, doNotAskAgainChecked)}
                  >
                    {t("no")}
                  </Button>
                  <Button
                    variant="primary"
                    onPress={() => onAction(Action.Yes, doNotAskAgainChecked)}
                  >
                    {t("yes")}
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </ModalContainer>
      </Modal.Backdrop>
    </Modal>
  );
};
