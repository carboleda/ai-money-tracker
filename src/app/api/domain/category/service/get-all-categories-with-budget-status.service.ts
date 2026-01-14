import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { GetAllCategoriesService } from "./get-all-categories.service";
import { CategoryModel, BudgetStatus } from "../model/category.model";
import {
  TransactionModel,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";
import type { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import type { FilterParams } from "@/app/api/domain/shared/interfaces/transaction-filter.interface";

interface CategoryWithBudgetStatus extends CategoryModel {
  budget?: BudgetStatus;
}

@Injectable()
export class GetAllCategoriesWithBudgetStatusService
  implements Service<void, CategoryWithBudgetStatus[]>
{
  constructor(
    private readonly getAllCategoriesService: GetAllCategoriesService,
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(): Promise<CategoryWithBudgetStatus[]> {
    // Get all categories (predefined + custom merged)
    const categories = await this.getAllCategoriesService.execute();

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

    // Enrich categories with budget status
    const categoriesWithBudget = categories.map((category) => {
      if (!category.budget) {
        return category;
      }

      const spent = categorySpending.get(category.ref) || 0;
      const remaining = Math.max(0, category.budget.limit - spent);
      const percentageUsed = (spent / category.budget.limit) * 100;
      const isAlerted =
        category.budget.alertThreshold !== undefined &&
        percentageUsed >= category.budget.alertThreshold;

      return {
        ...category,
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
