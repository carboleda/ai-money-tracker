"use client";

import { Button, Table } from "@heroui/react";
import { Account } from "@/interfaces/account";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { IconEdit } from "@/components/shared/icons";
import { AccountModalForm } from "../AccountModalForm/AccountModalForm";
import { useMemo, useState } from "react";
import { DeleteTableItemButton } from "@/components/DeleteTableItemButton";
import { useMutateAccount } from "@/hooks/useMutateAccount";
import { useRenderCell } from "./Columns";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useTableHeight } from "@/hooks/useTableHeight";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";
import { EmptyTableState } from "@/components/shared/EmptyTableState";

interface AccountsTableProps {
  isLoading: boolean;
  accounts?: Account[];
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  isLoading,
  accounts,
}) => {
  const { t } = useTranslation(LocaleNamespace.Accounts);
  const [selectedItem, setSelectedItem] = useState<Account>();
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteAccount } = useMutateAccount();
  const { columns, renderCell } = useRenderCell();
  const { maxTableHeight } = useTableHeight();

  const filteredAccounts = useMemo(() => {
    if (!accounts) return accounts;

    let filtered = [...accounts];

    if (filterValue) {
      filtered = filtered.filter(
        (account) =>
          account.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          account.ref.toLowerCase().includes(filterValue.toLowerCase()) ||
          account.type.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [accounts, filterValue]);

  const onDialogDismissed = () => {
    setSelectedItem(undefined);
    setIsOpen(false);
  };

  const onEdit = (item: Account) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const renderTopContent = () => (
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
        <div className="flex w-fit justify-end">
          <Button
            variant="primary"
            className="bg-success text-success-foreground"
            isIconOnly
            onPress={() => setIsOpen(true)}
          >
            <HiOutlinePlusCircle className="text-lg" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading || !accounts) return <TableSkeleton />;

  return (
    <>
      {renderTopContent()}
      <Table>
        <Table.ScrollContainer
          className="overflow-y-auto"
          style={{ maxHeight: maxTableHeight }}
        >
          <Table.Content aria-label={t("accounts")}>
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
              items={filteredAccounts}
              renderEmptyState={() => (
                <EmptyTableState message={t("emptyContent")} />
              )}
            >
              {(item) => (
                <Table.Row key={item.id} id={item.id}>
                  <Table.Collection items={columns}>
                    {(column) => {
                      if (column.key === "actions") {
                        return (
                          <Table.Cell>
                            <div className="flex flex-col gap-1 items-center md:flex-row md:justify-center">
                              <Button
                                isIconOnly
                                variant="tertiary"
                                className="self-center text-warning"
                                aria-label="Edit"
                                onPress={() => onEdit(item)}
                              >
                                <IconEdit />
                              </Button>
                              <DeleteTableItemButton
                                itemId={item.id}
                                isDisabled={isMutating}
                                deleteTableItem={deleteAccount}
                              />
                            </div>
                          </Table.Cell>
                        );
                      }

                      return renderCell({
                        key: column.key,
                        item,
                        onEdit,
                        onDelete: deleteAccount,
                        isDeleteDisabled: isMutating,
                      });
                    }}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <AccountModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
