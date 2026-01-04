import { AccountSummary, TransactionModel } from "../model/transaction.model";
import { CreateTransactionInput } from "../ports/inbound/create-transaction.port";
import { UpdateTransactionInput } from "../ports/inbound/update-transaction.port";
import { TransactionOutput } from "../ports/outbound/filter-transactions.port";

export class TransactionMapper {
  static fromCreateToModel(input: CreateTransactionInput): TransactionModel {
    return new TransactionModel({
      ...input,
      id: null,
      sourceAccount: this.minimalAccountSummary(input.sourceAccount)!,
      destinationAccount: this.minimalAccountSummary(input.destinationAccount),
    });
  }

  static fromUpdateToModel(input: UpdateTransactionInput): TransactionModel {
    return new TransactionModel({
      ...input,
      sourceAccount: this.minimalAccountSummary(input.sourceAccount)!,
      destinationAccount: this.minimalAccountSummary(input.destinationAccount),
      createdAt: new Date(input.createdAt),
    });
  }

  static toOutputPort(model: TransactionModel): TransactionOutput {
    return {
      ...model,
      id: model.id!,
      sourceAccount: model.sourceAccount,
      destinationAccount: model.destinationAccount,
      createdAt: model.createdAt.toISOString(),
    };
  }

  private static minimalAccountSummary(
    accountRef?: string
  ): AccountSummary | undefined {
    if (!accountRef) {
      return;
    }

    return {
      ref: accountRef,
    };
  }
}
