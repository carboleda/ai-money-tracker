import { Account } from "@/interfaces/account";
import {
  Summary,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import _ from "lodash";
import { AccountShareFunctions } from "../accounts/functions";

export class SummaryShareFunctions {
  static async computeSummary(transactions: Transaction[]): Promise<Summary> {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalPending = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING) {
        totalPending += transaction.amount;
        return;
      }

      if (transaction.type == TransactionType.INCOME) {
        totalIncomes += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    const accounts = await AccountShareFunctions.getAllAccounts();
    const totalBalance = accounts.reduce(
      (acc, account) => acc + account.balance,
      0
    );

    return {
      totalIncomes,
      totalExpenses,
      totalPending,
      totalBalance,
    };
  }

  static getSummaryByCategory(
    transactions: Transaction[]
  ): { category: string; total: number }[] {
    const categoryGroups = _.groupBy(transactions, "category");
    return Object.entries(categoryGroups).map(([category, transactions]) => {
      const total =
        transactions?.reduce(
          (acc, transaction) => acc + transaction.amount,
          0
        ) ?? 0;

      return { category, total };
    });
  }

  static getSummaryByType(
    transactions: Transaction[]
  ): { type: string; total: number }[] {
    const transactionTypeGroups = _.groupBy(transactions, "type");
    return Object.entries(transactionTypeGroups).map(([type, transactions]) => {
      const total = transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );
      return { type, total };
    });
  }

  static getSummaryByAccount(transactions: Transaction[]): Account[] {
    const accountGroups = _.groupBy(transactions, "sourceAccount");

    const totalByAccount = Object.entries(accountGroups).reduce(
      (accountDic, [account, trxs]) => {
        const total = trxs!.reduce((acc, transaction) => {
          if (transaction.type === TransactionType.INCOME) {
            return acc + transaction.amount;
          }

          if (transaction.type === TransactionType.EXPENSE) {
            return acc - transaction.amount;
          }

          const destinationAccount = transaction.destinationAccount! as string;
          accountDic[destinationAccount] = accountDic[destinationAccount]
            ? accountDic[destinationAccount] + transaction.amount
            : transaction.amount;

          return acc - transaction.amount;
        }, 0);
        accountDic[account] = total;

        return accountDic;
      },
      {} as Record<string, number>
    );

    return Object.entries(totalByAccount).map(([key, total]) => ({
      id: key,
      account: key,
      balance: total,
    }));
  }
}
