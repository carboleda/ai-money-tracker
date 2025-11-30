import { getUserId } from "@/app/api/context/user-context";
import { Firestore } from "firebase-admin/firestore";
import {
  Collections,
  CollectionsType,
} from "@/app/api/drivers/firestore/types";

export class BaseFirestoreRepository {
  constructor(
    protected readonly collection: CollectionsType,
    protected readonly firestore: Firestore,
    private readonly globalContextUserId: string
  ) {}

  protected getUserId(): string {
    return this.globalContextUserId ?? getUserId();
  }

  protected getUserCollectionReference(): FirebaseFirestore.CollectionReference {
    const userId = this.getUserId();
    console.log("Getting collection reference for userId:", userId);
    return this.firestore
      .collection(Collections.Users)
      .doc(userId)
      .collection(this.collection);
  }
}
