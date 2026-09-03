import { Drawer } from "@heroui/react";
import { PropsWithChildren } from "react";
import { useZolventFilterContext } from "./ZolventFilter";

const ZolventFilterDrawerContainer: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { isFilterOpen, setIsFilterOpen } = useZolventFilterContext();
  return (
    <Drawer>
      <Drawer.Backdrop
        variant="blur"
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Handle />
              <Drawer.Heading>Filters</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>{children}</Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default ZolventFilterDrawerContainer;
