import "reflect-metadata";
import { container } from "tsyringe";
import { GetAllRecurringExpensesService } from "./service/get-all-recurring-expenses.service";
import { CreateRecurringExpenseService } from "./service/create-recurring-expense.service";
import { UpdateRecurringExpenseService } from "./service/update-recurring-expense.service";
import { DeleteRecurringExpenseService } from "./service/delete-recurring-expense.service";
import { ScheduleRecurringExpenseService } from "./service/schedule-recurring-expense.service";

export class RecurringExpenseModule {
  static register(): void {
    // Register recurring expense services
    container.register(GetAllRecurringExpensesService, {
      useClass: GetAllRecurringExpensesService,
    });
    container.register(CreateRecurringExpenseService, {
      useClass: CreateRecurringExpenseService,
    });
    container.register(UpdateRecurringExpenseService, {
      useClass: UpdateRecurringExpenseService,
    });
    container.register(DeleteRecurringExpenseService, {
      useClass: DeleteRecurringExpenseService,
    });
    container.register(ScheduleRecurringExpenseService, {
      useClass: ScheduleRecurringExpenseService,
    });
  }
}
