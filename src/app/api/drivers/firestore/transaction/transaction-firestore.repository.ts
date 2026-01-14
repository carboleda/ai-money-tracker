import {
  Injectable,
  Inject,
  InjectUserContext,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { TransactionRepository } from "@/app/api/domain/transaction/repository/transaction.repository";
import {
  TransactionModel,
  TransactionStatus,
  AccountSummary,
  CategorySummary,
} from "@/app/api/domain//transaction/model/transaction.model";
import { Filter, Firestore, UpdateData } from "firebase-admin/firestore";
import { TransactionAdapter } from "./transaction.adapter";
import { Collections } from "../types";
import { TransactionEntity } from "./transaction.entity";
import type { FilterParams } from "@/app/api/domain/shared/interfaces/transaction-filter.interface";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";
import type { AccountRepository } from "@/app/api/domain/account/repository/account.repository";
import type { CategoryRepository } from "@/app/api/domain/category/repository/category.repository";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { CategoryModel } from "@/app/api/domain/category/model/category.model";
import * as fs from "node:fs";
import * as path from "node:path";

interface PredefinedCategory {
  ref: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  description: string;
}

@Injectable()
export class TransactionFirestoreRepository
  extends BaseFirestoreRepository
  implements TransactionRepository
{
  private readonly predefinedCategoryMap: Map<string, PredefinedCategory> =
    new Map();

  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext,
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository,
    @InjectRepository(CategoryModel)
    private readonly categoryRepository: CategoryRepository
  ) {
    super(Collections.Transactions, firestore, userContext);
    this.loadPredefinedCategories();
  }

  private loadPredefinedCategories(): void {
    try {
      const filePath = path.join(
        process.cwd(),
        "src/config/predefined-categories.json"
      );
      const jsonData = fs.readFileSync(filePath, "utf-8");
      const categories: PredefinedCategory[] = JSON.parse(jsonData);

      categories.forEach((cat) => {
        this.predefinedCategoryMap.set(cat.ref, cat);
      });
    } catch (error) {
      console.error("Failed to load predefined categories:", error);
    }
  }

  /**
   * Enriches transactions with account details (name and icon)
   * Fetches all accounts once and maps them to account summaries
   */
  private async enrichTransactionsWithAccounts(
    transactions: (TransactionEntity & { id: string })[]
  ): Promise<Array<TransactionEntity>> {
    // Fetch all accounts once
    const allAccounts = await this.accountRepository.getAll();

    // Create lookup map by ref
    const accountMap = new Map<string, AccountSummary>();
    allAccounts.forEach((account) => {
      accountMap.set(account.ref, {
        ref: account.ref,
        name: account.name,
        icon: account.icon,
      });
    });

    // Enrich transactions with account summaries
    return transactions.map((transaction) => {
      const sourceAccountSummary =
        accountMap.get(transaction.sourceAccount) ?? transaction.sourceAccount;

      const destinationAccountSummary = transaction.destinationAccount
        ? accountMap.get(transaction.destinationAccount) ??
          transaction.destinationAccount
        : undefined;

      // Store the enriched data separately for adapter to use
      return {
        ...transaction,
        sourceAccount: sourceAccountSummary as any,
        destinationAccount: destinationAccountSummary as any,
      };
    });
  }

  /**
   * Enriches transactions with category details (name, icon, color)
   * Merges predefined and custom categories, then maps to category summaries
   */
  private async enrichTransactionsWithCategories(
    transactions: Array<
      (TransactionEntity & { id: string }) | TransactionEntity
    >
  ): Promise<Array<TransactionEntity & { id?: string }>> {
    // Get all custom categories from Firestore
    const customCategories = await this.categoryRepository.getAll();

    // Create lookup maps
    const customCategoryMap = new Map<string, CategorySummary>();
    customCategories.forEach((cat) => {
      customCategoryMap.set(cat.ref, {
        ref: cat.ref,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isCustom: cat.isCustom,
      });
    });

    // Enrich transactions with category summaries
    return transactions.map((transaction) => {
      if (!transaction.category) {
        return transaction;
      }

      const categoryRef = transaction.category;

      // Check custom categories first, then predefined
      let categorySummary: CategorySummary | undefined;
      if (customCategoryMap.has(categoryRef)) {
        categorySummary = customCategoryMap.get(categoryRef);
      } else if (this.predefinedCategoryMap.has(categoryRef)) {
        const predefined = this.predefinedCategoryMap.get(categoryRef)!;
        categorySummary = {
          ref: predefined.ref,
          name: predefined.name,
          icon: predefined.icon,
          color: predefined.color,
          isCustom: false,
        };
      }

      return {
        ...transaction,
        category: categorySummary ?? categoryRef,
      } as any;
    });
  }

  async getById(id: string): Promise<TransactionModel | null> {
    const doc = await this.getUserCollectionReference().doc(id).get();
    if (!doc.exists) {
      return null;
    }

    const entity = { ...doc.data(), id: doc.id } as TransactionEntity & {
      id: string;
    };
    const enrichedAccounts = await this.enrichTransactionsWithAccounts([
      entity,
    ]);
    const enrichedCategories = await this.enrichTransactionsWithCategories(
      enrichedAccounts
    );
    return TransactionAdapter.toModel(enrichedCategories[0], doc.id);
  }

  async create(transaction: TransactionModel): Promise<string> {
    const entity = TransactionAdapter.toEntity(transaction);
    const docRef = await this.getUserCollectionReference().add(entity);
    return docRef.id;
  }

  async update(transaction: TransactionModel): Promise<void> {
    const entity = TransactionAdapter.toEntity(
      transaction
    ) as UpdateData<TransactionEntity>;
    const docRef = this.getUserCollectionReference().doc(transaction.id!);
    await docRef.update(entity);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.getUserCollectionReference().doc(id);
    await docRef.delete();
  }

  async searchTransactions(params: FilterParams): Promise<TransactionModel[]> {
    const { status, account, startDate, endDate } = params;

    const collectionRef = this.getUserCollectionReference();
    let q = collectionRef.orderBy(
      "createdAt",
      status === TransactionStatus.PENDING ? "asc" : "desc"
    );

    if (startDate && endDate) {
      q = q
        .where("createdAt", ">=", startDate)
        .where("createdAt", "<=", endDate);
    }

    if (account) {
      q = q.where(
        Filter.and(
          Filter.or(
            Filter.where("sourceAccount", "==", account),
            Filter.where("destinationAccount", "==", account)
          )
        )
      );
    }

    const snapshot = await q.get();
    const entities = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Array<TransactionEntity & { id: string }>;

    const enrichedAccounts = await this.enrichTransactionsWithAccounts(
      entities
    );
    const enrichedCategories = await this.enrichTransactionsWithCategories(
      enrichedAccounts
    );
    return enrichedCategories.map((entity) =>
      TransactionAdapter.toModel(entity, entity.id || "")
    );
  }
}
