"use client";

import React, { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { formatCurrency } from "@/config/utils";
import { ChipProps } from "@nextui-org/chip";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

export type Color = ChipProps["color"];

export type DataRow = {
  id: string;
  name: ReactNode;
  amount: number;
  color: Color;
};

export interface TableTileProps {
  columns: string[];
  data: DataRow[];
}

export const TileTable: React.FC<TableTileProps> = ({ columns, data }) => {
  const { t } = useTranslation(LocaleNamespace.Summary);
  return (
    <Table isCompact isStriped aria-label="Summary table">
      <TableHeader>
        <TableColumn>{columns[0]}</TableColumn>
        <TableColumn className="text-end">{columns[1]}</TableColumn>
      </TableHeader>
      <TableBody emptyContent={t("emptyContent")}>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="capitalize">{item.name}</TableCell>
            <TableCell className="text-end">
              <TransactionTypeDecorator color={item.color}>
                {formatCurrency(item.amount)}
              </TransactionTypeDecorator>
            </TableCell>
          </TableRow>
        )) ?? []}
      </TableBody>
    </Table>
  );
};
