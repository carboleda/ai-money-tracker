"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Chip, Surface } from "@heroui/react";
import {
  HiBanknotes,
  HiEye,
  HiEyeSlash,
  HiMiniArrowPathRoundedSquare,
} from "react-icons/hi2";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMeasuredTableHeight } from "@/hooks/useMeasuredTableHeight";
import { useMutateCategory } from "@/hooks/useMutateCategory";
import { useDeleteTableItem } from "@/hooks/useDeleteTableItem";
import { useTableSelection } from "@/hooks/useTableSelection";
import { fetchJson } from "@/config/request";
import { formatCurrency } from "@/config/utils";
import {
  ZolventFilter,
  useZolventFilterContext,
} from "@/components/shared/ZolventFilter/ZolventFilter";
import { TableSkeleton } from "@/components/shared/Table/TableSkeleton";
import { TableToolbar } from "@/components/shared/Table/TableToolbar";
import type { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";
import type { GetRecurringExpensesOutput, RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { CategoryBudgetRow } from "@/components/features/CategoryBudgets/CategoryBudgetRow";
import { CategoryModalForm } from "@/components/features/CategoryBudgets/CategoryModalForm/CategoryModalForm";
import { RecurringExpenseModalForm } from "@/components/features/RecurringExpenses";

const CATEGORY_KEY = "/api/category/with-budget";
const RECURRING_KEY = "/api/recurring-expenses";

interface GetCategoriesWithBudgetStatusOutput {
  categories: CategoryWithBudgetStatusOutput[];
}

interface CategoryBudgetListProps {
  isLoading: boolean;
  categories: CategoryWithBudgetStatusOutput[];
  recurringExpensesByCategoryRef: Map<string, RecurringExpenseOutput[]>;
  hideEmptyCategories: boolean;
  setHideEmptyCategories: (hideEmptyCategories: boolean) => void;
}

function CategoryBudgetList({
  isLoading,
  categories,
  recurringExpensesByCategoryRef,
  hideEmptyCategories,
  setHideEmptyCategories,
}: Readonly<CategoryBudgetListProps>) {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const { appliedFilters } = useZolventFilterContext();
  const filterValue = appliedFilters.freeText ?? "";
  const { maxTableHeight, containerRef } = useMeasuredTableHeight();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [selectedRecurringItem, setSelectedRecurringItem] =
    useState<RecurringExpenseOutput>();
  const { isMutating, deleteConfig } = useMutateCategory();
  const { onDelete } = useDeleteTableItem({ onConfirmDelete: deleteConfig });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesText =
        !filterValue ||
        category.name.toLowerCase().includes(filterValue.toLowerCase());
      const hasRecurring =
        (recurringExpensesByCategoryRef.get(category.ref)?.length ?? 0) > 0;
      return matchesText && (!hideEmptyCategories || hasRecurring);
    });
  }, [categories, filterValue, hideEmptyCategories, recurringExpensesByCategoryRef]);

  const {
    selectedItem: selectedCategory,
    setSelectedItem: setSelectedCategory,
    clearSelection,
  } = useTableSelection({ items: filteredCategories, isMutating });

  const onEdit = (item: CategoryWithBudgetStatusOutput) => {
    setSelectedCategory(item);
    setIsEditOpen(true);
  };

  const onEditDismissed = () => {
    clearSelection();
    setIsEditOpen(false);
  };

  const onToggleRowSelection = (category: CategoryWithBudgetStatusOutput) => {
    const isAlreadySelected = selectedCategory?.ref === category.ref;
    setSelectedCategory(isAlreadySelected ? undefined : category);
  };

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
    <>
      <ZolventFilter.FreeTextFilter
        className="top-freetext-filter"
        inputGroupClassName="rounded-2xl"
        applyOnChange
      />
      <Surface variant="secondary" className="w-full rounded-3xl px-1 pb-1">
        <TableToolbar
          selectedItem={selectedCategory}
          isMutating={isMutating}
          rowCount={filteredCategories.length}
          t={t}
        >
          <TableToolbar.NewAction
            noItemRequired
            noSeparator
            onPress={() => setIsCreateOpen(true)}
          />
          <TableToolbar.EditAction onPress={onEdit} />
          <TableToolbar.DeleteAction
            isDisabled={!selectedCategory?.isCustom}
            onPress={(item: CategoryWithBudgetStatusOutput) =>
              onDelete(item.id, item.name).then((ok) => ok && clearSelection())
            }
          />
          <TableToolbar.NewAction
            icon={<HiMiniArrowPathRoundedSquare />}
            labelKey="addRecurring"
            onPress={onAddRecurring}
          />
          <TableToolbar.ToggleAction
            isSelected={hideEmptyCategories}
            onChange={setHideEmptyCategories}
            labelKey="hideEmptyCategories"
            icon={hideEmptyCategories ? <HiEyeSlash /> : <HiEye />}
          />
        </TableToolbar>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div
            ref={containerRef}
            className="flex flex-col w-full gap-0.5 overflow-y-auto"
            style={{ maxHeight: maxTableHeight }}
          >
            {filteredCategories.map((category) => (
              <CategoryBudgetRow
                key={category.ref}
                category={category}
                existingCategories={categories}
                recurringExpenses={
                  recurringExpensesByCategoryRef.get(category.ref) ?? []
                }
                isSelected={selectedCategory?.ref === category.ref}
                onToggleSelect={() => onToggleRowSelection(category)}
                onEditRecurring={onEditRecurring}
              />
            ))}
          </div>
        )}
      </Surface>
      <CategoryModalForm
        existingCategories={categories}
        isOpen={isCreateOpen}
        onDismiss={() => setIsCreateOpen(false)}
      />
      <CategoryModalForm
        category={selectedCategory}
        existingCategories={categories}
        isOpen={isEditOpen}
        onDismiss={onEditDismissed}
      />
      <RecurringExpenseModalForm
        item={selectedRecurringItem}
        defaultCategoryRef={selectedCategory?.ref}
        isOpen={isRecurringModalOpen}
        onDismiss={onRecurringModalDismissed}
      />
    </>
  );
}

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const { setPageTitle } = useAppStore();
  const [hideEmptyCategories, setHideEmptyCategories] = useLocalStorage<boolean>(
    "category-budgets-hide-empty",
    true,
  );

  useEffect(() => {
    setPageTitle(t("categoryBudgets"), t("subtitle"));
  }, [t, setPageTitle]);

  const { isLoading: isLoadingCategories, data: categoriesResponse } =
    useQuery<GetCategoriesWithBudgetStatusOutput>({
      queryKey: [CATEGORY_KEY],
      queryFn: () =>
        fetchJson<GetCategoriesWithBudgetStatusOutput>(CATEGORY_KEY),
    });

  const { isLoading: isLoadingRecurring, data: recurringResponse } =
    useQuery<GetRecurringExpensesOutput>({
      queryKey: [RECURRING_KEY],
      queryFn: () => fetchJson<GetRecurringExpensesOutput>(RECURRING_KEY),
    });

  const isLoading = isLoadingCategories || isLoadingRecurring;

  const categories = useMemo(
    () =>
      (categoriesResponse?.categories ?? []).toSorted((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [categoriesResponse],
  );

  const recurringExpensesByCategoryRef = useMemo(() => {
    const map = new Map<string, RecurringExpenseOutput[]>();
    (recurringResponse?.recurringExpensesConfig ?? []).forEach((expense) => {
      const ref = expense.category.ref;
      map.set(ref, [...(map.get(ref) ?? []), expense]);
    });
    return map;
  }, [recurringResponse]);

  const budgetSummary = useMemo(
    () =>
      categories.reduce(
        (acc, category) => {
          if (category.budget) {
            acc.totalSpent += category.budget.spent;
            acc.totalLimit += category.budget.limit;
          }
          return acc;
        },
        { totalSpent: 0, totalLimit: 0 },
      ),
    [categories],
  );

  return (
    <ZolventFilter
      t={t}
      storageKey="category-budgets-filters"
      onFilter={() => {}}
    >
      <section className="flex flex-col w-full items-center justify-center gap-2">
        <div className="flex flex-col w-full justify-start items-start gap-2 mb-2">
          <Chip
            color={
              budgetSummary.totalSpent > budgetSummary.totalLimit
                ? "danger"
                : "accent"
            }
            variant="soft"
            className="rounded-sm"
          >
            <HiBanknotes />
            {t("spentBudget", {
              spent: formatCurrency(budgetSummary.totalSpent),
              limit: formatCurrency(budgetSummary.totalLimit),
            })}
          </Chip>
        </div>
        <CategoryBudgetList
          isLoading={isLoading}
          categories={categories}
          recurringExpensesByCategoryRef={recurringExpensesByCategoryRef}
          hideEmptyCategories={hideEmptyCategories}
          setHideEmptyCategories={setHideEmptyCategories}
        />
      </section>
    </ZolventFilter>
  );
}

export default PageContent;
