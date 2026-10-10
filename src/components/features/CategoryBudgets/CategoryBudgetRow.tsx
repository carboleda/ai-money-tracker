"use client";

import React, { useState } from "react";
import { Button, Chip, ProgressBar, Surface } from "@heroui/react";
import { FaStar } from "react-icons/fa";
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
import { CategoryModalForm } from "./CategoryModalForm/CategoryModalForm";
import { CategoryType } from "@/app/api/domain/category/model/category.model";

interface CategoryBudgetRowProps {
  category: CategoryWithBudgetStatusOutput;
  existingCategories: CategoryWithBudgetStatusOutput[];
  recurringExpenses: RecurringExpenseOutput[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onEditRecurring: (item: RecurringExpenseOutput) => void;
}

export const CategoryBudgetRow: React.FC<CategoryBudgetRowProps> = ({
  category,
  existingCategories,
  recurringExpenses,
  isSelected,
  onToggleSelect,
  onEditRecurring,
}) => {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [useRecurringAsBudget, setUseRecurringAsBudget] = useState(false);

  const { deleteConfig } = useMutateRecurringExpenses();
  const { onDelete } = useDeleteTableItem({ onConfirmDelete: deleteConfig });

  const { budget } = category;
  const isOverCommitted =
    !!budget && category.committedFromRecurring > budget.limit;
  const percentageUsed = budget ? Math.min(budget.percentageUsed, 100) : 0;

  return (
    <Surface variant="default" className="flex flex-col w-full p-2 gap-2">
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
        <div
          role="button"
          tabIndex={0}
          onClick={onToggleSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleSelect();
            }
          }}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
        >
          <CustomIcon
            icon={category.icon}
            isChecked={isSelected}
            badgeColor="accent"
            badgeIcon={
              category.isCustom ? <FaStar className="size-1.5" /> : undefined
            }
          />
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">
                {category.name}{" "}
                <Chip>
                  {t("recurringCount", { count: recurringExpenses.length })}
                </Chip>
              </span>
              {isOverCommitted && (
                <Chip size="sm" color="warning" variant="soft">
                  {t("overCommitted")}
                </Chip>
              )}
            </div>
            {!category.restrictedTypes.includes(CategoryType.INCOME) && (
              <>
                {budget ? (
                  <div className="flex flex-col gap-1 w-full text-left">
                    <ProgressBar
                      aria-label="Percentage used"
                      className="w-full"
                      size="sm"
                      value={percentageUsed}
                      color={
                        budget?.isAlerted || isOverCommitted
                          ? "danger"
                          : "accent"
                      }
                    >
                      <ProgressBar.Track className="bg-muted/30 dark:bg-zinc-700/80">
                        <ProgressBar.Fill />
                      </ProgressBar.Track>
                    </ProgressBar>
                    <span className="text-xs text-muted">
                      {t("spentOfLimit", {
                        spent: formatCurrency(budget.spent),
                        limit: formatCurrency(budget.limit),
                      })}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    {category.committedFromRecurring > 0 && (
                      <>
                        {t("committedNoBudget", {
                          amount: formatCurrency(
                            category.committedFromRecurring,
                          ),
                        })}{" "}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUseRecurringAsBudget(
                          category.committedFromRecurring > 0,
                        );
                        setIsBudgetModalOpen(true);
                      }}
                      className="text-warning underline font-bold dark:font-normal cursor-pointer"
                    >
                      {category.committedFromRecurring > 0
                        ? t("useAsBudget")
                        : t("setBudget")}
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-0.5 pl-8">
          {recurringExpenses.map((expense) => (
            <Surface
              variant="tertiary"
              key={expense.id}
              className="flex items-center justify-between gap-2 rounded-xl p-2"
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
              <div className="flex items-center gap-1 shrink-0">
                <Chip
                  color={expense.disabled ? "default" : "accent"}
                  size="sm"
                  variant="soft"
                >
                  {formatCurrency(expense.amount)}
                </Chip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="tertiary"
                  aria-label={t("edit")}
                  onPress={() => onEditRecurring(expense)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="tertiary"
                  aria-label={t("delete")}
                  onPress={() => onDelete(expense.id, expense.description)}
                >
                  <IconDelete size={16} />
                </Button>
              </div>
            </Surface>
          ))}
        </div>
      )}
      <CategoryModalForm
        category={category}
        existingCategories={existingCategories}
        isOpen={isBudgetModalOpen}
        useRecurringAsBudget={useRecurringAsBudget}
        onDismiss={() => setIsBudgetModalOpen(false)}
      />
    </Surface>
  );
};
