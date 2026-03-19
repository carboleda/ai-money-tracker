import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { ScheduleRecurringExpenseService } from "./schedule-recurring-expense.service";
import { GetAllUsersService } from "@/app/api/domain/user/service/get-all-users.service";
import { runWithUserContext } from "@/app/api/context/user-context";
import {
  ScheduleExecutionResult,
  ScheduleResult,
} from "../model/recurring-expense.dto";

@Injectable()
export class ScheduleRecurringExpenseForAllUsersService {
  private readonly logPrefix = `[${ScheduleRecurringExpenseForAllUsersService.name}]`;
  constructor(
    private readonly getAllUsersService: GetAllUsersService,
    private readonly scheduleRecurringExpenseService: ScheduleRecurringExpenseService
  ) {}

  async execute(): Promise<ScheduleExecutionResult> {
    const users = await this.getAllUsersService.execute();
    const results: ScheduleResult[] = [];

    for (const user of users) {
      if (!user.email) {
        console.log(
          `${this.logPrefix} Skipping user ${user.id} due to missing email`
        );
        continue;
      }

      await runWithUserContext(user.email, async () => {
        const { created, skipped } =
          await this.scheduleRecurringExpenseService.execute();
        results.push({
          userId: user.id,
          created: created,
          skipped: skipped,
        });
      });
    }

    return {
      success: true,
      processedUsers: results.length,
      details: results,
    };
  }
}
