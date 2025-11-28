import "reflect-metadata";
import { container } from "tsyringe";
import { GetAllRecurrentExpensesService } from "./service/get-all-recurrent-expenses.service";
import { CreateRecurrentExpenseService } from "./service/create-recurrent-expense.service";
import { UpdateRecurrentExpenseService } from "./service/update-recurrent-expense.service";
import { DeleteRecurrentExpenseService } from "./service/delete-recurrent-expense.service";
import { ScheduleRecurrentExpenseService } from "./service/schedule-recurrent-expense.service";

export class RecurrentExpenseModule {
  static register(): void {
    // Register recurrent expense services
    container.register(GetAllRecurrentExpensesService, {
      useClass: GetAllRecurrentExpensesService,
    });
    container.register(CreateRecurrentExpenseService, {
      useClass: CreateRecurrentExpenseService,
    });
    container.register(UpdateRecurrentExpenseService, {
      useClass: UpdateRecurrentExpenseService,
    });
    container.register(DeleteRecurrentExpenseService, {
      useClass: DeleteRecurrentExpenseService,
    });
    container.register(ScheduleRecurrentExpenseService, {
      useClass: ScheduleRecurrentExpenseService,
    });
  }
}
