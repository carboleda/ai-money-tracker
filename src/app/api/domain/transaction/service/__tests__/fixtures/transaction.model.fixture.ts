import {
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

export const transactionModelFixture = {
  id: "1",
  type: TransactionType.EXPENSE,
  amount: 100,
  description: "Test transaction",
  createdAt: new Date(),
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account1",
};

export const transactionModelFixtureWithId = {
  ...transactionModelFixture,
  id: "1",
};

export const getSeveralTransactionModels = (
  count: number,
  partialTransactionModel: Partial<TransactionModel> = {}
): TransactionModel[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...transactionModelFixture,
    id: (index + 1).toString(),
    createdAt: new Date(Date.now() - index * 1000 * 60 * 60 * 24),
    ...partialTransactionModel,
  }));
};

// Income Transaction Fixtures
export const salaryIncome = new TransactionModel({
  id: "1",
  description: "Salary",
  type: TransactionType.INCOME,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 1000,
  createdAt: new Date(),
});

export const bonusIncome = new TransactionModel({
  id: "2",
  description: "Bonus",
  type: TransactionType.INCOME,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 500,
  createdAt: new Date(),
});

export const largeIncome = new TransactionModel({
  id: "1",
  description: "Large income",
  type: TransactionType.INCOME,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 999999999.99,
  createdAt: new Date(),
});

// Expense Transaction Fixtures
export const groceryExpense = new TransactionModel({
  id: "1",
  description: "Groceries",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 100,
  createdAt: new Date(),
});

export const utilitiesExpense = new TransactionModel({
  id: "2",
  description: "Utilities",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 50,
  createdAt: new Date(),
});

export const largeExpense = new TransactionModel({
  id: "2",
  description: "Large expense",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 500000000.5,
  createdAt: new Date(),
});

// Pending Transaction Fixtures
export const pendingPayment = new TransactionModel({
  id: "1",
  description: "Pending payment",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.PENDING,
  sourceAccount: "account-1",
  amount: 200,
  createdAt: new Date(),
});

export const pendingIncome = new TransactionModel({
  id: "2",
  description: "Pending income",
  type: TransactionType.INCOME,
  status: TransactionStatus.PENDING,
  sourceAccount: "account-1",
  amount: 300,
  createdAt: new Date(),
});

export const pendingTransfer = new TransactionModel({
  id: "1",
  description: "Pending transfer",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.PENDING,
  sourceAccount: "account-1",
  destinationAccount: "account-2",
  amount: 200,
  createdAt: new Date(),
});

// Transfer Transaction Fixtures
export const basicTransfer = new TransactionModel({
  id: "1",
  description: "Transfer to savings",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  destinationAccount: "account-2",
  amount: 500,
  createdAt: new Date(),
});

export const transferWithPrefixedDestination = new TransactionModel({
  id: "1",
  description: "Transfer to savings",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  destinationAccount: "accounts/account-2",
  amount: 500,
  createdAt: new Date(),
});

export const transferWithoutDestination = new TransactionModel({
  id: "1",
  description: "Transfer",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: "account-1",
  amount: 500,
  createdAt: new Date(),
});

// Mixed Transaction Collections
export const twoIncomeTransactions = [salaryIncome, bonusIncome];

export const twoExpenseTransactions = [groceryExpense, utilitiesExpense];

export const twoPendingTransactions = [pendingPayment, pendingIncome];

export const mixedTransactions = [
  new TransactionModel({
    id: "1",
    description: "Salary",
    type: TransactionType.INCOME,
    status: TransactionStatus.COMPLETE,
    sourceAccount: "account-1",
    amount: 2000,
    createdAt: new Date(),
  }),
  new TransactionModel({
    id: "2",
    description: "Groceries",
    type: TransactionType.EXPENSE,
    status: TransactionStatus.COMPLETE,
    sourceAccount: "account-1",
    amount: 100,
    createdAt: new Date(),
  }),
  new TransactionModel({
    id: "3",
    description: "Pending bill",
    type: TransactionType.EXPENSE,
    status: TransactionStatus.PENDING,
    sourceAccount: "account-1",
    amount: 50,
    createdAt: new Date(),
  }),
  new TransactionModel({
    id: "4",
    description: "Transfer",
    type: TransactionType.TRANSFER,
    status: TransactionStatus.COMPLETE,
    sourceAccount: "account-1",
    destinationAccount: "account-2",
    amount: 300,
    createdAt: new Date(),
  }),
];

export const largeNumbers = [largeIncome, largeExpense];
