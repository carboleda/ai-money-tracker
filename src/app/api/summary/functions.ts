import { Account } from "@/interfaces/account";
import {
  Summary,
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@/interfaces/transaction";
import _ from "lodash";
import { AccountShareFunctions } from "../accounts/functions";
import { RecurrentVsVariable } from "@/interfaces/summary";
import { getAccountId } from "@/config/utils";

export class SummaryShareFunctions {
  static async computeSummary(
    transactions: Transaction[],
    account?: string
  ): Promise<Summary> {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let totalPending = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING) {
        totalPending += transaction.amount;
        return;
      }

      if (
        transaction.type === TransactionType.TRANSFER &&
        account &&
        transaction.destinationAccount
      ) {
        const accountId = getAccountId(transaction.destinationAccount);
        if (accountId === account) {
          return;
        }
      }

      if (transaction.type == TransactionType.INCOME) {
        totalIncomes += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    const accounts = await AccountShareFunctions.getAllAccounts();
    const totalBalance = SummaryShareFunctions.computeBalance(accounts);

    return {
      totalIncomes,
      totalExpenses,
      totalPending,
      totalBalance,
    };
  }

  static computeBalance(accounts: Account[]): number {
    return accounts.reduce((acc, account) => acc + account.balance, 0);
  }

  static getSummaryByCategory(
    transactions: Transaction[]
  ): { category: string; total: number }[] {
    const categoryGroups = _.groupBy(transactions, "category");
    return Object.entries(categoryGroups).map(([category, transactions]) => {
      const total =
        transactions?.reduce(
          (acc, transaction) =>
            acc +
            (transaction.type === TransactionType.INCOME
              ? transaction.amount
              : transaction.amount * -1),
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

  static getRecurrentVsVariableComparison(
    transactions: Transaction[]
  ): RecurrentVsVariable {
    const init = {
      recurrentCount: 0,
      variableCount: 0,
      recurrentTotal: 0,
      variableTotal: 0,
    };
    const recurrentCategories = [TransactionCategory.Mercado];
    const isReccurent = (transaction: Transaction): boolean =>
      transaction.status === TransactionStatus.COMPLETE &&
      transaction.type === TransactionType.EXPENSE &&
      (transaction.isReccurent ||
        recurrentCategories.includes(
          transaction.category! as TransactionCategory
        ));

    const summary = transactions.reduce((acc, transaction) => {
      if (isReccurent(transaction)) {
        acc.recurrentCount++;
        acc.recurrentTotal += transaction.amount;
      } else {
        acc.variableCount++;
        acc.variableTotal += transaction.amount;
      }

      return acc;
    }, init);

    return {
      count: [
        { value: summary.recurrentCount, type: "recurrent" },
        { value: summary.variableCount, type: "variable" },
      ],
      total: [
        { value: summary.recurrentTotal, type: "recurrent" },
        { value: summary.variableTotal, type: "variable" },
      ],
    } as RecurrentVsVariable;
  }
}
