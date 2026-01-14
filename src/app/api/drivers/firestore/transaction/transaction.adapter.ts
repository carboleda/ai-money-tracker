import {
  TransactionModel,
  AccountSummary,
  CategorySummary,
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
      category: TransactionAdapter.fallbackCategorySummary(entity.category),
      createdAt: entity.createdAt.toDate(),
      isRecurrent: entity.isRecurrent ?? false,
    });
  }

  static toEntity(model: TransactionModel): TransactionEntity {
    const {
      id: _,
      sourceAccount,
      destinationAccount,
      category,
      ...rest
    } = model;

    let categoryRef: string | undefined;
    if (category) {
      categoryRef = typeof category === "string" ? category : category.ref;
    }

    return {
      ...rest,
      sourceAccount: sourceAccount.ref || (sourceAccount as unknown as string),
      destinationAccount:
        destinationAccount?.ref || (destinationAccount as unknown as string),
      category: categoryRef,
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

    if (typeof account !== "string") {
      return account;
    }

    return {
      ref: account || "",
      name: null,
      icon: null,
    };
  }

  /**
   * Provides a fallback mechanism to ensure a CategorySummary object is returned.
   * If the input is a string (category reference), it creates a minimal CategorySummary
   * with the reference populated and other fields set to null. If the input is already
   * a CategorySummary object, it returns it as-is. Returns undefined if no category is provided.
   *
   * @param category - Either a CategorySummary object or a string representing the category reference.
   *                   If undefined or falsy, the method returns undefined.
   * @returns A CategorySummary object with populated fields, or undefined if category is not provided.
   */
  private static fallbackCategorySummary(
    category?: CategorySummary | string
  ): CategorySummary | undefined {
    if (!category) {
      return;
    }

    if (typeof category !== "string") {
      return category;
    }

    return {
      ref: category || "",
      name: "Unknown",
      icon: null,
      color: null,
    };
  }
}
