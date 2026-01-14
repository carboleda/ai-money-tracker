import { container } from "tsyringe";
import { GetAllCategoriesService } from "./service/get-all-categories.service";
import { CreateCategoryService } from "./service/create-category.service";
import { UpdateCategoryService } from "./service/update-category.service";
import { DeleteCategoryService } from "./service/delete-category.service";
import { ValidateCategoryService } from "./service/validate-category.service";
import { ValidateBudgetService } from "./service/validate-budget.service";
import { GetAllCategoriesWithBudgetStatusService } from "./service/get-all-categories-with-budget-status.service";

export class CategoryModule {
  static register(): void {
    // Register services
    container.register(GetAllCategoriesService, {
      useClass: GetAllCategoriesService,
    });

    container.register(CreateCategoryService, {
      useClass: CreateCategoryService,
    });

    container.register(UpdateCategoryService, {
      useClass: UpdateCategoryService,
    });

    container.register(DeleteCategoryService, {
      useClass: DeleteCategoryService,
    });

    container.register(ValidateCategoryService, {
      useClass: ValidateCategoryService,
    });

    container.register(ValidateBudgetService, {
      useClass: ValidateBudgetService,
    });

    container.register(GetAllCategoriesWithBudgetStatusService, {
      useClass: GetAllCategoriesWithBudgetStatusService,
    });
  }
}
