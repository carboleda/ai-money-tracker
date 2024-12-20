"use client";

import React, { useState } from "react";
import { AgCharts } from "ag-charts-react";
import { CategorySummary } from "@/interfaces/summary";
import { useCategoryChart } from "@/hooks/charts/useCategoryChart";
import { ChartDetailsModal } from "./ChartDetailsModal";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { Transaction } from "@/interfaces/transaction";
import { formatCurrency, formatTimeDate } from "@/config/utils";
import { TransactionTypeDecorator } from "../TransactionTypeDecorator";
import { Chip } from "@nextui-org/chip";

export interface CategoriesChartProps {
  data?: CategorySummary[];
  detail?: Transaction[];
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({
  data,
  detail,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategorySummary>();

  const onCategoryClick = (category: CategorySummary) => {
    setIsOpen(true);
    setSelectedCategory(category);
  };

  const { options } = useCategoryChart({ data, onCategoryClick });

  return (
    <>
      <div className="w-full p-5 rounded-xl shadow-md border-1 dark:shadow-none dark:border-0 dark:bg-zinc-900">
        <AgCharts options={options} />
      </div>
      {detail && isOpen && selectedCategory && (
        <ChartDetailsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={
            <span>
              Transactions for category
              <Chip radius="sm" variant="flat" className="ml-2">
                <span className="font-bold">{selectedCategory.category}</span>
              </Chip>
            </span>
          }
        >
          <>
            <Table
              isCompact
              isStriped
              removeWrapper
              aria-label="Category detail"
            >
              <TableHeader>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn className="text-end">AMOUNT</TableColumn>
              </TableHeader>
              <TableBody>
                {detail
                  .filter((t) => t.category === selectedCategory.category)
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        {formatTimeDate(new Date(transaction.createdAt))}
                      </TableCell>
                      <TableCell className="text-end">
                        <TransactionTypeDecorator type={transaction.type}>
                          {formatCurrency(transaction.amount)}
                        </TransactionTypeDecorator>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <div className="text-end">
              <TransactionTypeDecorator color="primary">
                <span className="font-bold">
                  TOTAL:&nbsp;
                  {formatCurrency(selectedCategory.total)}
                </span>
              </TransactionTypeDecorator>
            </div>
          </>
        </ChartDetailsModal>
      )}
    </>
  );
};
