import {
  Injectable,
  Inject,
  InjectUserContext,
} from "@/app/api/decorators/tsyringe.decorator";
import { SummaryHistoryRepository } from "@/app/api/domain/summary/repository/summary-history.repository";
import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { SummaryHistoryAdapter } from "./summary-history.adapter";
import { Collections } from "../types";
import { SummaryHistoryEntity } from "./summary-history.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";

@Injectable()
export class SummaryHistoryFirestoreRepository
  extends BaseFirestoreRepository
  implements SummaryHistoryRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext
  ) {
    super(Collections.TransactionsSummaryHistory, firestore, userContext);
  }

  async create(model: SummaryHistoryModel): Promise<string> {
    const entity = SummaryHistoryAdapter.toEntity(model);
    const docRef = await this.getUserCollectionReference().add(entity);

    return docRef.id;
  }

  async getHistorySince(date: Date): Promise<SummaryHistoryModel[]> {
    const query = this.getUserCollectionReference()
      .where("createdAt", ">=", Timestamp.fromDate(date))
      .orderBy("createdAt", "asc");

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as SummaryHistoryEntity;
      return SummaryHistoryAdapter.toModel(entity, doc.id);
    });
  }
}
