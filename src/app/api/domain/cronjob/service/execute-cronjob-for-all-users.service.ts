import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { PendingTransactionNotificationService } from "@/app/api/domain/notification/service/pending-transaction-notification.service";
import { CreateMonthlySummaryService } from "@/app/api/domain/summary/service/create-monthly-summary.service";
import { GetAllUsersService } from "@/app/api/domain/user/service/get-all-users.service";
import { runWithUserContext } from "@/app/api/context/user-context";
import { CronjobExecutionResult, CronjobResult } from "../model/cronjob.dto";

@Injectable()
export class ExecuteCronjobForAllUsersService {
  private readonly logPrefix = `[${ExecuteCronjobForAllUsersService.name}]`;
  constructor(
    private readonly getAllUsersService: GetAllUsersService,
    private readonly notificationService: PendingTransactionNotificationService,
    private readonly summaryHistoryService: CreateMonthlySummaryService
  ) {}

  async execute(): Promise<CronjobExecutionResult> {
    const users = await this.getAllUsersService.execute();
    const results: CronjobResult[] = [];

    for (const user of users) {
      if (!user.email) {
        console.log(
          `${this.logPrefix} Skipping user ${user.id} due to missing email`
        );
        continue;
      }

      await runWithUserContext(user.email, async () => {
        const [notificationResult, summaryResult] = await Promise.allSettled([
          this.notificationService.execute(),
          this.summaryHistoryService.execute(),
        ]);

        results.push({
          userId: user.id,
          notificationStatus: notificationResult.status,
          summaryStatus: summaryResult.status,
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
