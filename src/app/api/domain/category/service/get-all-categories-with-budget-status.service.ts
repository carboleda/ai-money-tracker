import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { GetAllCategoriesService } from "./get-all-categories.service";
import { GetRecurringCommitmentByCategoryService } from "./get-recurring-commitment-by-category.service";
import { CategoryModel, BudgetStatus } from "../model/category.model";
import {
  TransactionModel,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";
import type { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import type { FilterParams } from "@/app/api/domain/shared/interfaces/transaction-filter.interface";

interface CategoryWithBudgetStatus extends CategoryModel {
  budget?: BudgetStatus;
  committedFromRecurring: number;
}

@Injectable()
export class GetAllCategoriesWithBudgetStatusService
  implements Service<void, CategoryWithBudgetStatus[]>
{
  constructor(
    private readonly getAllCategoriesService: GetAllCategoriesService,
    private readonly getRecurringCommitmentByCategoryService: GetRecurringCommitmentByCategoryService,
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(): Promise<CategoryWithBudgetStatus[]> {
    // Get all categories (predefined + custom merged)
    const categories = await this.getAllCategoriesService.execute();

    const commitmentByCategoryRef =
      await this.getRecurringCommitmentByCategoryService.execute();

    // Get current month transactions (COMPLETE status only)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const params: FilterParams = {
      status: TransactionStatus.COMPLETE,
      startDate: monthStart,
      endDate: monthEnd,
    };

    const monthTransactions =
      await this.transactionRepository.searchTransactions(params);

    // Group transactions by category ref and sum amounts
    const categorySpending = new Map<string, number>();
    monthTransactions.forEach((transaction) => {
      if (transaction.category) {
        const categoryRef =
          typeof transaction.category === "string"
            ? transaction.category
            : transaction.category.ref;

        const currentSpent = categorySpending.get(categoryRef) || 0;
        categorySpending.set(categoryRef, currentSpent + transaction.amount);
      }
    });

    // Enrich categories with budget status and recurring commitment
    const categoriesWithBudget = categories.map((category) => {
      const committedFromRecurring =
        commitmentByCategoryRef.get(category.ref) || 0;

      if (!category.budget) {
        return { ...category, committedFromRecurring };
      }

      const spent = categorySpending.get(category.ref) || 0;
      const remaining = Math.max(0, category.budget.limit - spent);
      const percentageUsed = (spent / category.budget.limit) * 100;
      const isAlerted =
        category.budget.alertThreshold !== undefined &&
        percentageUsed >= category.budget.alertThreshold;

      return {
        ...category,
        committedFromRecurring,
        budget: {
          limit: category.budget.limit,
          alertThreshold: category.budget.alertThreshold,
          spent,
          remaining,
          percentageUsed,
          isAlerted,
        } as BudgetStatus,
      };
    });

    return categoriesWithBudget as CategoryWithBudgetStatus[];
  }
}
