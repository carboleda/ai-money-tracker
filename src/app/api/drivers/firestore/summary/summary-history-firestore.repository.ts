import {
  Injectable,
  InjectUserId,
} from "@/app/api/decorators/tsyringe.decorator";
import { SummaryHistoryRepository } from "@/app/api/domain/summary/repository/summary-history.repository";
import { SummaryHistoryModel } from "@/app/api/domain/summary/model/summary-history.model";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { SummaryHistoryAdapter } from "./summary-history.adapter";
import { Collections } from "../types";
import { SummaryHistoryEntity } from "./summary-history.entity";

@Injectable()
export class SummaryHistoryFirestoreRepository
  implements SummaryHistoryRepository
{
  constructor(
    private readonly firestore: Firestore,
    @InjectUserId() private readonly userId: string
  ) {}

  async create(model: SummaryHistoryModel): Promise<string> {
    const entity = SummaryHistoryAdapter.toEntity(model);
    const docRef = await this.firestore
      .collection(Collections.Users)
      .doc(this.userId)
      .collection(Collections.TransactionsSummaryHistory)
      .add(entity);

    return docRef.id;
  }

  async getHistorySince(date: Date): Promise<SummaryHistoryModel[]> {
    const query = this.firestore
      .collection(Collections.Users)
      .doc(this.userId)
      .collection(Collections.TransactionsSummaryHistory)
      .where("createdAt", ">=", Timestamp.fromDate(date))
      .orderBy("createdAt", "asc");

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as SummaryHistoryEntity;
      return SummaryHistoryAdapter.toModel(entity, doc.id);
    });
  }
}
