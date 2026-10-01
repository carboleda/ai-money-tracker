import { useMeasuredTableHeight } from "@/hooks/useMeasuredTableHeight";
import { HasId, RenderCellProps, TableColumn } from "@/interfaces/global";
import { Key, Selection, Table } from "@heroui/react";
import { EmptyTableState } from "./EmptyTableState";
import { TFunction } from "i18next";
import { PropsWithChildren, ReactNode } from "react";

interface TableContainerProps<T extends HasId> extends PropsWithChildren {
  t: TFunction;
  ariaLabelKey: string;
  emptyContentLabelKey?: string;
  items: T[] | undefined;
  columns: TableColumn[];
  selectedKeys: Selection;
  onSelectionChange: (keys: Selection) => void;
  renderCell: (args: RenderCellProps<T>) => ReactNode;
  renderSeparator?: (id: string, colSpan: number, title: string) => ReactNode;
  separators?: Set<Key>;
  disabledKeys?: Set<Key>;
}

export const TableContainer = <T extends HasId>({
  t,
  ariaLabelKey,
  emptyContentLabelKey,
  items,
  columns,
  selectedKeys,
  onSelectionChange,
  renderCell,
  renderSeparator,
  disabledKeys,
  separators,
}: Readonly<TableContainerProps<T>>) => {
  const { maxTableHeight, containerRef } = useMeasuredTableHeight();
  const visibleColumns = columns.filter((column) => !column.hidden);

  return (
    <Table.ScrollContainer
      ref={containerRef}
      className="overflow-y-auto"
      style={{ maxHeight: maxTableHeight }}
    >
      <Table.Content
        className="table-fixed md:table-auto"
        aria-label={t(ariaLabelKey)}
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        disabledKeys={disabledKeys}
      >
        <Table.Header
          columns={columns}
          className="hidden md:table-header-group"
        >
          {(column) => (
            <Table.Column
              key={column.key}
              id={column.key}
              className={column.className}
              isRowHeader={column.isRowHeader}
            >
              {t(column.key)}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body
          items={items}
          dependencies={[selectedKeys]}
          renderEmptyState={() => (
            <EmptyTableState
              message={t(emptyContentLabelKey ?? "emptyContent")}
            />
          )}
        >
          {(item) => {
            const isChecked =
              ((typeof selectedKeys === "string" && selectedKeys === "all") ||
                selectedKeys?.has(item.id)) ??
              false;

            if (separators?.has(item.id)) {
              return renderSeparator?.(
                item.id,
                columns.length,
                t(`separators.${item.id}`, item.id),
              );
            }

            return (
              <Table.Row key={item.id}>
                <Table.Collection
                  items={visibleColumns}
                  dependencies={[isChecked]}
                >
                  {(column) => {
                    return renderCell({
                      key: column.key,
                      item,
                      isChecked,
                    });
                  }}
                </Table.Collection>
              </Table.Row>
            );
          }}
        </Table.Body>
      </Table.Content>
    </Table.ScrollContainer>
  );
};
