import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { ScheduleRecurrentExpenseService } from "./schedule-recurrent-expense.service";
import { GetAllUsersService } from "@/app/api/domain/user/service/get-all-users.service";
import { runWithUserContext } from "@/app/api/context/user-context";
import {
  ScheduleExecutionResult,
  ScheduleResult,
} from "../model/recurrent-expense.dto";

@Injectable()
export class ScheduleRecurrentExpenseForAllUsersService {
  constructor(
    private readonly getAllUsersService: GetAllUsersService,
    private readonly scheduleRecurrentExpenseService: ScheduleRecurrentExpenseService
  ) {}

  async execute(): Promise<ScheduleExecutionResult> {
    const users = await this.getAllUsersService.execute();
    const results: ScheduleResult[] = [];

    for (const user of users) {
      await runWithUserContext(user.email, async () => {
        const { created, skipped } =
          await this.scheduleRecurrentExpenseService.execute();
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
