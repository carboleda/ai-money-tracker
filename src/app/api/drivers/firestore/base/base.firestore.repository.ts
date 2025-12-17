import { getUserContext, UserContext } from "@/app/api/context/user-context";
import { Firestore } from "firebase-admin/firestore";
import {
  Collections,
  CollectionsType,
} from "@/app/api/drivers/firestore/types";

export class BaseFirestoreRepository {
  constructor(
    protected readonly collection: CollectionsType,
    protected readonly firestore: Firestore,
    private readonly globalUserContext: UserContext
  ) {}

  protected getUserContext(): UserContext {
    return this.globalUserContext ?? getUserContext();
  }

  protected getUserCollectionReference(): FirebaseFirestore.CollectionReference {
    const userContext = this.getUserContext();
    return this.firestore
      .collection(Collections.Users)
      .doc(userContext.id)
      .collection(this.collection);
  }
}
