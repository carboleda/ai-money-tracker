"use client";

import { Table } from "@heroui/react";
import { Account } from "@/interfaces/account";
import { TableSkeleton } from "@/components/shared/Table/TableSkeleton";
import { AccountModalForm } from "../AccountModalForm/AccountModalForm";
import { useMemo, useState } from "react";
import { useMutateAccount } from "@/hooks/useMutateAccount";
import { useRenderCell } from "./Columns";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { SearchToolbar } from "@/components/features/Transactions/SearchToolbar";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { TableToolbar } from "@/components/shared/Table/TableToolbar";
import { useTableSelection } from "@/hooks/useTableSelection";
import { TableContainer } from "@/components/shared/Table/TableContainer";

interface AccountsTableProps {
  isLoading: boolean;
  accounts?: Account[];
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  isLoading,
  accounts,
}) => {
  const { t } = useTranslation(LocaleNamespace.Accounts);
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const { isMutating, deleteAccount } = useMutateAccount();
  const { columns, renderCell } = useRenderCell();
  const { onDelete } = useDeleteTableItem({ onConfirmDelete: deleteAccount });
  const filteredAccounts = useMemo(() => {
    if (!accounts) return accounts;

    let filtered = [...accounts];

    if (filterValue) {
      filtered = filtered.filter(
        (account) =>
          account.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          account.ref.toLowerCase().includes(filterValue.toLowerCase()) ||
          account.type.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [accounts, filterValue]);

  const {
    selectedItem,
    setSelectedItem,
    selectedKeys,
    onSelectionChange,
    clearSelection,
  } = useTableSelection({ items: filteredAccounts, isMutating });

  const onDialogDismissed = () => {
    clearSelection();
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
      </div>
    </div>
  );

  if (isLoading || !accounts) return <TableSkeleton />;

  return (
    <>
      {renderTopContent()}
      <Table>
        <TableToolbar
          selectedItem={selectedItem}
          isMutating={isMutating}
          rowCount={filteredAccounts?.length}
          t={t}
        >
          <TableToolbar.NewAction
            noItemRequired
            noSeparator
            onPress={() => setIsOpen(true)}
          />
          <TableToolbar.EditAction onPress={onEdit} />
          <TableToolbar.DeleteAction
            onPress={(item: Account) => onDelete(item.id, item.name)}
          />
        </TableToolbar>
        <TableContainer
          t={t}
          ariaLabelKey="accounts"
          renderCell={renderCell}
          columns={columns}
          items={accounts}
          onSelectionChange={onSelectionChange}
          selectedKeys={selectedKeys}
        />
      </Table>
      <AccountModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
