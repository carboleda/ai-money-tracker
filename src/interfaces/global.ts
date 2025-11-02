import { Key } from "react";

export interface TableColumn {
  key: string;
  className?: string;
}

export interface RenderCellProps<T> {
  key: Key;
  item: T;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  isDeleteDisabled?: boolean;
}
