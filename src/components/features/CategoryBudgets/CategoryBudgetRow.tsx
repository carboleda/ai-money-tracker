"use client";

import React, { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { HiOutlinePlusCircle } from "react-icons/hi";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { formatCurrency, formatFrequency } from "@/config/utils";
import { CustomIcon } from "@/components/shared/CustomIcon";
import { IconChevronDown, IconEdit, IconDelete } from "@/components/shared/icons";
import type { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";
import type { RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { useMutateRecurringExpenses } from "@/hooks/useMutateRecurringExpense";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { RecurringExpenseModalForm } from "@/components/features/RecurringExpenses";
import { CategoryBudgetModalForm } from "./CategoryBudgetModalForm";

interface CategoryBudgetRowProps {
  category: CategoryWithBudgetStatusOutput;
  recurringExpenses: RecurringExpenseOutput[];
}

export const CategoryBudgetRow: React.FC<CategoryBudgetRowProps> = ({
  category,
  recurringExpenses,
}) => {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [selectedRecurringItem, setSelectedRecurringItem] =
    useState<RecurringExpenseOutput>();

  const { deleteConfig } = useMutateRecurringExpenses();
  const { onDelete } = useDeleteTableItem({ onConfirmDelete: deleteConfig });

  const { budget } = category;
  const isOverCommitted =
    !!budget && category.committedFromRecurring > budget.limit;
  const percentageUsed = budget ? Math.min(budget.percentageUsed, 100) : 0;
  const progressColorClass =
    budget?.isAlerted || isOverCommitted ? "bg-danger" : "bg-accent";

  const onAddRecurring = () => {
    setSelectedRecurringItem(undefined);
    setIsRecurringModalOpen(true);
  };

  const onEditRecurring = (item: RecurringExpenseOutput) => {
    setSelectedRecurringItem(item);
    setIsRecurringModalOpen(true);
  };

  const onRecurringModalDismissed = () => {
    setSelectedRecurringItem(undefined);
    setIsRecurringModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full rounded-lg bg-muted/10 dark:bg-zinc-900 p-3 gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={isExpanded ? t("collapse") : t("expand")}
          onClick={() => setIsExpanded((v) => !v)}
          className="shrink-0 cursor-pointer"
        >
          <IconChevronDown
            size={18}
            className={clsx("transition-transform", isExpanded && "rotate-180")}
          />
        </button>
        <CustomIcon icon={category.icon} />
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {category.name}{" "}
              <Chip>
                {t("recurringCount", { count: recurringExpenses.length })}
              </Chip>
            </span>
            {isOverCommitted && (
              <Chip
                size="sm"
                color="warning"
                variant="soft"
                className="rounded-sm"
              >
                {t("overCommitted")}
              </Chip>
            )}
          </div>
          {budget ? (
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              className="flex flex-col gap-1 w-full text-left cursor-pointer"
            >
              <div className="w-full h-2 rounded-full bg-default overflow-hidden">
                <div
                  className={clsx("h-full rounded-full", progressColorClass)}
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
              <span className="text-xs text-muted">
                {t("spentOfLimit", {
                  spent: formatCurrency(budget.spent),
                  limit: formatCurrency(budget.limit),
                })}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted">
                {category.committedFromRecurring > 0
                  ? t("committedNoBudget", {
                      amount: formatCurrency(category.committedFromRecurring),
                    })
                  : t("noBudgetSet")}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => setIsBudgetModalOpen(true)}
              >
                {category.committedFromRecurring > 0
                  ? t("useAsBudget", {
                      amount: formatCurrency(category.committedFromRecurring),
                    })
                  : t("setBudget")}
              </Button>
            </div>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-2 pl-9">
          {recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-2 rounded-md bg-white dark:bg-zinc-800 p-2"
            >
              <div className="flex flex-col min-w-0">
                <span
                  className={clsx(
                    "text-sm truncate",
                    expense.disabled && "opacity-50",
                  )}
                >
                  {expense.description}
                </span>
                <span className="text-xs text-muted">
                  {formatFrequency(expense.frequency, expense.dueDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={clsx("text-sm", expense.disabled && "opacity-50")}
                >
                  {formatCurrency(expense.amount)}
                </span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={t("edit")}
                  onPress={() => onEditRecurring(expense)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={t("delete")}
                  onPress={() => onDelete(expense.id, expense.description)}
                >
                  <IconDelete size={16} />
                </Button>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onPress={onAddRecurring}
            className="self-start"
          >
            <HiOutlinePlusCircle />
            {t("addRecurring")}
          </Button>
        </div>
      )}
      <CategoryBudgetModalForm
        category={category}
        isOpen={isBudgetModalOpen}
        onDismiss={() => setIsBudgetModalOpen(false)}
      />
      <RecurringExpenseModalForm
        item={selectedRecurringItem}
        defaultCategoryRef={category.ref}
        isOpen={isRecurringModalOpen}
        onDismiss={onRecurringModalDismissed}
      />
    </div>
  );
};
