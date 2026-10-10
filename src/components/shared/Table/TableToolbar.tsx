import {
  ButtonGroup,
  Button,
  ButtonProps,
  ToggleButton,
  Chip,
  PressEvent,
  Badge,
} from "@heroui/react";
import { IoFilterSharp, IoTrashBin } from "react-icons/io5";
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
  t: TFunction;
  isMutating: boolean;
  onOpenFilter?: (e: PressEvent) => void;
  activeFiltersCount?: number;
  selectedItem?: { id: string } & Record<string, any>;
  rowCount?: number;
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
  onOpenFilter,
  activeFiltersCount = 0,
  rowCount = 0,
  children,
  t,
}) => {
  const contextValue = useMemo(
    () => ({ selectedItem, isMutating, t }),
    [selectedItem, isMutating, t],
  );

  return (
    <TableToolbarContext.Provider value={contextValue}>
      <div className="flex flex-row gap-1 items-center py-2 justify-between w-full">
        <ButtonGroup variant="ghost">{children}</ButtonGroup>
        <div className="flex gap-1 items-center pr-3">
          <Chip size="sm" color="accent" variant="soft">
            {t("rowCounter", { count: rowCount || 0 })}
          </Chip>
          {onOpenFilter && (
            <Badge.Anchor>
              <Button
                variant="ghost"
                aria-label={t("filter")}
                isIconOnly
                onPress={onOpenFilter}
              >
                <IoFilterSharp className="text-6xl" />
              </Button>
              {activeFiltersCount > 0 && (
                <Badge color="danger" size="sm">
                  {activeFiltersCount}
                </Badge>
              )}
            </Badge.Anchor>
          )}
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
      isDisabled={isMutating || (!noItemRequired && !selectedItem) || isDisabled}
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

interface ToggleActionProps {
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  labelKey: string;
  icon?: ReactNode;
}

const ToggleAction: React.FC<ToggleActionProps> = ({
  isSelected,
  onChange,
  labelKey,
  icon,
}) => {
  const { t } = useTableToolbarContext();
  const isMobile = useIsMobile();
  const label = t(labelKey);

  return (
    <ToggleButton
      aria-label={label}
      variant="ghost"
      isIconOnly={isMobile}
      isSelected={isSelected}
      onChange={onChange}
    >
      {icon}
      {!isMobile && label}
    </ToggleButton>
  );
};

export const TableToolbar = Object.assign(TableToolbarRoot, {
  NewAction,
  EditAction,
  DeleteAction,
  ConfirmAction,
  ToggleAction,
});
