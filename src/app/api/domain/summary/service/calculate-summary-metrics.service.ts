import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import {
  TransactionModel,
  TransactionStatus,
} from "@/app/api/domain/transaction/model/transaction.model";
import { GetAllAccountsService } from "@/app/api/domain/account/service/get-all.service";
import { Service } from "@/app/api/domain/interfaces/service.interface";
import { SummaryMetricsModel } from "../model/summary-metrics.model";
import { TransactionType } from "@/interfaces/transaction";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { getAccountId } from "@/config/utils";

@Injectable()
export class CalculateSummaryMetricsService
  implements Service<TransactionModel[], SummaryMetricsModel>
{
  constructor(private readonly getAllAccountsService: GetAllAccountsService) {}

  /**
   * Calculates summary metrics for transactions, handling transfers based on source and destination accounts.
   *
   * For transfers:
   * - If no specific account is provided, all transfers are counted in totalTransfers
   * - If a specific account is provided:
   *   - When account matches destination account, transfers are counted as transfers
   *   - When account matches source account, transfers are counted as expenses for that account
   * - This prevents double-counting transfers when viewing account-specific summaries
   *
   * @param transactions Array of transactions to calculate metrics from
   * @param account Optional account ID to filter transfers by destination
   * @returns Promise<SummaryMetricsModel> containing calculated metrics
   */
  async execute(
    transactions: TransactionModel[],
    account?: string
  ): Promise<SummaryMetricsModel> {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalPending = 0;
    let totalTransfers = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING) {
        totalPending += transaction.amount;
        return;
      }

      if (
        transaction.type === TransactionType.TRANSFER &&
        transaction.destinationAccount
      ) {
        if (!account) {
          totalTransfers += transaction.amount;
          return;
        }

        const accountId = getAccountId(transaction.destinationAccount);
        if (accountId === account) {
          totalTransfers += transaction.amount;
          return;
        }
      }

      if (transaction.type == TransactionType.INCOME) {
        totalIncomes += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    const accounts = await this.getAllAccountsService.execute();
    const totalBalance = this.computeBalance(accounts);

    return new SummaryMetricsModel({
      totalIncomes,
      totalExpenses,
      totalPending,
      totalTransfers,
      totalBalance,
    });
  }

  private computeBalance(accounts: AccountModel[]): number {
    return accounts.reduce((acc, account) => acc + account.balance, 0);
  }
}
