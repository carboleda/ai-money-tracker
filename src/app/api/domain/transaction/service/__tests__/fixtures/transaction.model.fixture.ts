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
