import { EmptyState } from "@heroui/react";
import { IoFileTray } from "react-icons/io5";

interface EmptyTableStateProps {
  message: React.ReactNode;
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({
  message,
}) => {
  return (
    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
      <IoFileTray className="size-6 text-muted" />
      <span className="text-sm text-muted">{message}</span>
    </EmptyState>
  );
};
