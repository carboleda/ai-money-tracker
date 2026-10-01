import { TFunction } from "i18next";
import { Key } from "react";

export interface TableColumn {
  key: string;
  className?: string;
  isRowHeader?: boolean;
  hidden?: boolean;
}

export interface RenderCellProps<T> {
  key: Key;
  item: T;
  t?: TFunction;
  isChecked?: boolean;
}

export interface HasId {
  id: string;
}
