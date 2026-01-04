"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Account } from "@/interfaces/account";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@heroui/button";
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
import { SearchToolbar } from "@/components/Transactions/SearchToolbar";

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
  const { columns, renderCell, rowHeight } = useRenderCell();
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-center w-full">
        <SearchToolbar
          filterValue={filterValue}
          onSearchChange={setFilterValue}
        />
        <div className="flex w-fit justify-end">
          <Button
            color="success"
            radius="sm"
            variant="solid"
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
      <Table
        isStriped
        isCompact
        isVirtualized
        maxTableHeight={maxTableHeight}
        rowHeight={rowHeight}
        aria-label={t("accounts")}
        topContentPlacement="outside"
        topContent={renderTopContent()}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className={`${column.className}`}>
              {t(column.key)}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={filteredAccounts} emptyContent={t("emptyContent")}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => {
                if (columnKey === "actions") {
                  return (
                    <TableCell>
                      <div className="text-center flex flex-row justify-center">
                        <Button
                          isIconOnly
                          color="warning"
                          variant="light"
                          className="self-center"
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
                    </TableCell>
                  );
                }

                return renderCell({
                  key: columnKey,
                  item,
                  onEdit,
                  onDelete: deleteAccount,
                  isDeleteDisabled: isMutating,
                });
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AccountModalForm
        item={selectedItem}
        isOpen={isOpen}
        onDismiss={onDialogDismissed}
      />
    </>
  );
};
