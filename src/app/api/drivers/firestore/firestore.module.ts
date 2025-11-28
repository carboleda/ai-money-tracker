import { container } from "tsyringe";
import { AccountFirestoreRepository } from "./account/account-firestore.repository";
import { TransactionFirestoreRepository } from "./transaction/transaction-firestore.repository";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { UserFirestoreRepository } from "./user/user-firestore.repository";
import { RecurrentExpenseFirestoreRepository } from "./recurrent-expense/recurrent-expense-firestore.repository";
import { SummaryHistoryFirestoreRepository } from "./summary/summary-history-firestore.repository";
import {
  getRepositoryToken,
  getUserIdToken,
} from "@/app/api/decorators/tsyringe.decorator";
import { TransactionModel } from "@/app/api/domain/transaction/model/transaction.model";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { RecurrentExpenseModel } from "@/app/api/domain/recurrent-expense/model/recurrent-expense.model";
import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";
import { getUserId } from "@/app/api/context/user-context";

export class FirestoreModule {
  static register(): void {
    // Register Firestore instance
    container.register(Firestore, {
      useFactory: () => getFirestore(),
    });

    // Register USER_ID token with factory that gets userId from context
    container.register(getUserIdToken(), {
      useFactory: () => getUserId(),
    });

    // Register repository implementations
    container.register(getRepositoryToken(AccountModel), {
      useClass: AccountFirestoreRepository,
    });

    container.register(getRepositoryToken(TransactionModel), {
      useClass: TransactionFirestoreRepository,
    });

    container.register(getRepositoryToken(UserModel), {
      useClass: UserFirestoreRepository,
    });

    container.register(getRepositoryToken(RecurrentExpenseModel), {
      useClass: RecurrentExpenseFirestoreRepository,
    });

    container.register(getRepositoryToken(SummaryHistoryModel), {
      useClass: SummaryHistoryFirestoreRepository,
    });
  }
}
