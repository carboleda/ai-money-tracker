import { TFunction } from "i18next";
import { Key } from "react";

export interface TableColumn {
  key: string;
  className?: string;
}

export interface RenderCellProps<T> {
  key: Key;
  item: T;
  t?: TFunction;
  isDeleteDisabled?: boolean;
  onEdit?: (item: T) => Promise<any> | void;
  onDelete?: (id: string) => Promise<any> | void;
}
