"use client";

import React, { ReactNode } from "react";
import { ChipProps, Table } from "@heroui/react";
import { formatCurrency } from "@/config/utils";
import { TransactionTypeDecorator } from "@/components/TransactionTypeDecorator";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { EmptyTableState } from "@/components/shared/Table/EmptyTableState";

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
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Summary table">
          <Table.Header>
            <Table.Column id="name" isRowHeader>
              {columns[0]}
            </Table.Column>
            <Table.Column id="amount" className="text-end">
              {columns[1]}
            </Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyTableState message={t("emptyContent")} />
            )}
          >
            {data.map((item) => (
              <Table.Row key={item.id} id={item.id}>
                <Table.Cell className="capitalize">{item.name}</Table.Cell>
                <Table.Cell className="text-end">
                  <TransactionTypeDecorator color={item.color}>
                    {formatCurrency(item.amount)}
                  </TransactionTypeDecorator>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
};
