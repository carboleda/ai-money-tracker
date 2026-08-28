import { ButtonGroup, Button, Typography, ButtonProps } from "@heroui/react";
import { IoTrashBin } from "react-icons/io5";
import { IconEdit } from "../icons";
import { TFunction } from "i18next";
import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { FaRegCircleCheck } from "react-icons/fa6";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { useIsMobile } from "@/hooks/useIsMobile";

interface TableToolbarProps extends PropsWithChildren {
  selectedItem?: { id: string } & Record<string, any>;
  isMutating: boolean;
  rowCount?: number;
  t: TFunction;
}

interface ActionProps extends ButtonProps {
  onPress: (item: any) => void;
  noItemRequired?: boolean;
  noSeparator?: boolean;
  labelKey?: string;
  icon?: ReactNode;
}

const TableToolbarContext = createContext<TableToolbarProps | undefined>(
  undefined,
);

// Helper hook to consume context safely
function useTableToolbarContext() {
  const context = useContext(TableToolbarContext);
  if (!context) {
    throw new Error(
      "TableToolbar Actions must be rendered within a <TableToolbar /> wrapper.",
    );
  }
  return context;
}

const TableToolbarRoot: React.FC<TableToolbarProps> = ({
  selectedItem,
  isMutating,
  rowCount,
  children,
  t,
}) => {
  const contextValue = useMemo(
    () => ({ selectedItem, isMutating, t }),
    [selectedItem, isMutating, t],
  );

  return (
    <TableToolbarContext.Provider value={contextValue}>
      <div className="flex flex-row gap-1 items-center py-2 justify-between">
        <ButtonGroup variant="ghost">{children}</ButtonGroup>
        <div className="pr-3">
          <Typography color="muted" type="body-xs">
            {t("rowCounter", { count: rowCount || 0 })}
          </Typography>
        </div>
      </div>
    </TableToolbarContext.Provider>
  );
};

const BaseAction: React.FC<ActionProps> = ({
  onPress: onAction,
  noItemRequired = false,
  noSeparator = false,
  labelKey,
  icon,
  isDisabled,
  ...buttonProps
}) => {
  const { t, selectedItem, isMutating } = useTableToolbarContext();
  const isMobile = useIsMobile();
  const label = labelKey && t(labelKey);

  return (
    <Button
      aria-label={label}
      variant="ghost"
      isIconOnly={isMobile}
      isDisabled={isMutating || (!noItemRequired && !selectedItem)}
      onPress={() => onAction?.(selectedItem)}
      {...buttonProps}
    >
      {noSeparator || <ButtonGroup.Separator />}
      {icon}
      {!isMobile && label}
    </Button>
  );
};

const NewAction: React.FC<ActionProps> = (props) => {
  return (
    <BaseAction icon={<HiOutlinePlusCircle />} labelKey={"new"} {...props} />
  );
};

const EditAction: React.FC<ActionProps> = (props) => {
  return <BaseAction icon={<IconEdit />} labelKey={"edit"} {...props} />;
};

const DeleteAction: React.FC<ActionProps> = (props) => {
  return (
    <BaseAction
      icon={<IoTrashBin className="text-danger-soft-foreground" />}
      labelKey={"delete"}
      {...props}
    />
  );
};

const ConfirmAction: React.FC<ActionProps> = (props) => {
  return (
    <BaseAction icon={<FaRegCircleCheck />} labelKey={"confirm"} {...props} />
  );
};

export const TableToolbar = Object.assign(TableToolbarRoot, {
  NewAction,
  EditAction,
  DeleteAction,
  ConfirmAction,
});
