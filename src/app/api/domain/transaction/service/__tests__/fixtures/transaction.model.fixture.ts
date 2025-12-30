import {
  TransactionCategory,
  TransactionModel,
  TransactionStatus,
  TransactionType,
} from "@/app/api/domain/transaction/model/transaction.model";

const mockDate = new Date("2024-01-15T10:30:00Z");

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
  sourceAccount: { ref: "account-1" },
  amount: 1000,
  createdAt: new Date(),
});

export const bonusIncome = new TransactionModel({
  id: "2",
  description: "Bonus",
  type: TransactionType.INCOME,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  amount: 500,
  createdAt: new Date(),
});

export const largeIncome = new TransactionModel({
  id: "1",
  description: "Large income",
  type: TransactionType.INCOME,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  amount: 999999999.99,
  createdAt: new Date(),
});

// Expense Transaction Fixtures
export const groceryExpense = new TransactionModel({
  id: "1",
  description: "Groceries",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  amount: 100,
  createdAt: new Date(),
});

export const utilitiesExpense = new TransactionModel({
  id: "2",
  description: "Utilities",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  amount: 50,
  createdAt: new Date(),
});

export const largeExpense = new TransactionModel({
  id: "2",
  description: "Large expense",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  amount: 500000000.5,
  createdAt: new Date(),
});

// Pending Transaction Fixtures
export const pendingPayment = new TransactionModel({
  id: "1",
  description: "Pending payment",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.PENDING,
  sourceAccount: { ref: "account-1" },
  amount: 200,
  createdAt: new Date(),
});

export const pendingIncome = new TransactionModel({
  id: "2",
  description: "Pending income",
  type: TransactionType.INCOME,
  status: TransactionStatus.PENDING,
  sourceAccount: { ref: "account-1" },
  amount: 300,
  createdAt: new Date(),
});

export const pendingTransfer = new TransactionModel({
  id: "1",
  description: "Pending transfer",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.PENDING,
  sourceAccount: { ref: "account-1" },
  destinationAccount: { ref: "account-2" },
  amount: 200,
  createdAt: new Date(),
});

// Transfer Transaction Fixtures
export const basicTransfer = new TransactionModel({
  id: "1",
  description: "Transfer to savings",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  destinationAccount: { ref: "account-2" },
  amount: 500,
  createdAt: new Date(),
});

export const transferWithPrefixedDestination = new TransactionModel({
  id: "1",
  description: "Transfer to savings",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  destinationAccount: { ref: "account-2" },
  amount: 500,
  createdAt: new Date(),
});

export const transferWithoutDestination = new TransactionModel({
  id: "1",
  description: "Transfer",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "account-1" },
  amount: 500,
  createdAt: new Date(),
});

export const transactionModelFixture = new TransactionModel({
  id: "transaction-123",
  description: "Test transaction",
  paymentLink: "https://example.com/payment",
  notes: "Test notes",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  category: TransactionCategory.Alimentos,
  sourceAccount: {
    ref: "checking",
  },
  destinationAccount: {
    ref: "savings",
  },
  amount: 100.5,
  createdAt: mockDate,
  isRecurrent: true,
});

export const minimalTransactionModelFixture = new TransactionModel({
  id: "minimal-transaction-456",
  description: "Minimal transaction",
  type: TransactionType.INCOME,
  status: TransactionStatus.PENDING,
  sourceAccount: {
    ref: "checking",
  },
  amount: 50,
  createdAt: mockDate,
});

export const transferTransactionModelFixture = new TransactionModel({
  id: "transfer-101",
  description: "Transfer between accounts",
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETE,
  sourceAccount: { ref: "checking" },
  destinationAccount: { ref: "savings" },
  amount: 200,
  createdAt: mockDate,
});

export const customCategoryTransactionModelFixture = new TransactionModel({
  id: "custom-category-789",
  description: "Custom category transaction",
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETE,
  category: "Custom Category",
  sourceAccount: { ref: "checking" },
  amount: 75.25,
  createdAt: mockDate,
});

export const transactionModelFixtureWithId = {
  ...transactionModelFixture,
  id: "1",
};

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
    sourceAccount: { ref: "account-1" },
    amount: 2000,
    createdAt: new Date(),
  }),
  new TransactionModel({
    id: "2",
    description: "Groceries",
    type: TransactionType.EXPENSE,
    status: TransactionStatus.COMPLETE,
    sourceAccount: { ref: "account-1" },
    amount: 100,
    createdAt: new Date(),
  }),
  new TransactionModel({
    id: "3",
    description: "Pending bill",
    type: TransactionType.EXPENSE,
    status: TransactionStatus.PENDING,
    sourceAccount: { ref: "account-1" },
    amount: 50,
    createdAt: new Date(),
  }),
  new TransactionModel({
    id: "4",
    description: "Transfer",
    type: TransactionType.TRANSFER,
    status: TransactionStatus.COMPLETE,
    sourceAccount: { ref: "account-1" },
    destinationAccount: { ref: "account-2" },
    amount: 300,
    createdAt: new Date(),
  }),
];

export const getTransactionModelWithCustomDate = (
  date: Date
): TransactionModel => {
  return new TransactionModel({
    ...transactionModelFixture,
    createdAt: date,
  });
};


export const largeNumbers = [largeIncome, largeExpense];
