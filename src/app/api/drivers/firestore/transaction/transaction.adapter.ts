import {
  TransactionModel,
  AccountSummary,
} from "@/app/api/domain/transaction/model/transaction.model";
import { TransactionEntity } from "./transaction.entity";
import { Timestamp } from "firebase-admin/firestore";

export class TransactionAdapter {
  static toModel(entity: TransactionEntity, id: string): TransactionModel {
    return new TransactionModel({
      ...entity,
      id,
      sourceAccount: TransactionAdapter.fallbackAccountSummary(
        entity.sourceAccount
      )!,
      destinationAccount: TransactionAdapter.fallbackAccountSummary(
        entity.destinationAccount
      ),
      createdAt: entity.createdAt.toDate(),
      isRecurrent: entity.isRecurrent ?? false,
    });
  }

  static toEntity(model: TransactionModel): TransactionEntity {
    const { id: _, sourceAccount, destinationAccount, ...rest } = model;
    return {
      ...rest,
      sourceAccount: sourceAccount.ref || (sourceAccount as unknown as string),
      destinationAccount:
        destinationAccount?.ref || (destinationAccount as unknown as string),
      createdAt: Timestamp.fromDate(model.createdAt),
    };
  }

  /**
   * Provides a fallback mechanism to ensure an AccountSummary object is returned.
   * If the input is a string (account reference), it creates a minimal AccountSummary
   * with the reference populated and other fields set to null. If the input is already
   * an AccountSummary object, it returns it as-is. Returns undefined if no account is provided.
   *
   * @param account - Either an AccountSummary object or a string representing the account reference.
   *                  If undefined or falsy, the method returns undefined.
   * @returns An AccountSummary object with populated fields, or undefined if account is not provided.
   */
  private static fallbackAccountSummary(
    account?: AccountSummary | string
  ): AccountSummary | undefined {
    if (!account) {
      return;
    }

    return {
      ref: (account as string) || "",
      name: null,
      icon: null,
    };
  }
}
