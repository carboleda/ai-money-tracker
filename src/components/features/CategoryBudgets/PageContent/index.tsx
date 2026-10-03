"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";
import { useAppStore } from "@/stores/useAppStore";
import { fetchJson } from "@/config/request";
import { ZolventFilter } from "@/components/shared/ZolventFilter/ZolventFilter";
import { TableSkeleton } from "@/components/shared/Table/TableSkeleton";
import { CategoryType, categoryAppliesToType } from "@/app/api/domain/category/model/category.model";
import type { CategoryWithBudgetStatusOutput } from "@/app/api/domain/category/ports/outbound/get-categories.port";
import type { GetRecurringExpensesOutput, RecurringExpenseOutput } from "@/app/api/domain/recurring-expense/ports/outbound/get-recurring-expenses.port";
import { CategoryBudgetRow } from "@/components/features/CategoryBudgets/CategoryBudgetRow";

const CATEGORY_KEY = "/api/category/with-budget";
const RECURRING_KEY = "/api/recurring-expenses";

interface GetCategoriesWithBudgetStatusOutput {
  categories: CategoryWithBudgetStatusOutput[];
}

function PageContent() {
  const { t } = useTranslation(LocaleNamespace.CategoryBudgets);
  const { setPageTitle } = useAppStore();

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
      (categoriesResponse?.categories ?? []).filter((category) =>
        categoryAppliesToType(category.restrictedTypes, CategoryType.EXPENSE)
      ),
    [categoriesResponse]
  );

  const recurringExpensesByCategoryRef = useMemo(() => {
    const map = new Map<string, RecurringExpenseOutput[]>();
    (recurringResponse?.recurringExpensesConfig ?? []).forEach((expense) => {
      const ref = expense.category.ref;
      map.set(ref, [...(map.get(ref) ?? []), expense]);
    });
    return map;
  }, [recurringResponse]);

  return (
    <ZolventFilter
      t={t}
      storageKey="category-budgets-filters"
      onFilter={() => {}}
    >
      <section className="flex flex-col w-full items-center justify-center gap-2">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="flex flex-col w-full gap-2">
            {categories.map((category) => (
              <CategoryBudgetRow
                key={category.ref}
                category={category}
                recurringExpenses={
                  recurringExpensesByCategoryRef.get(category.ref) ?? []
                }
              />
            ))}
          </div>
        )}
      </section>
    </ZolventFilter>
  );
}

export default PageContent;
