import { Injectable, Inject } from "@/app/api/decorators/tsyringe.decorator";
import { Firestore } from "firebase-admin/firestore";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { Collections } from "@/app/api/drivers/firestore/types";
import { UserAdapter } from "@/app/api/drivers/firestore/user/user.adapter";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserFirestoreRepository implements UserRepository {
  constructor(@Inject(Firestore) private readonly firestore: Firestore) {}

  async getExistingUser(): Promise<UserModel | null> {
    const snapshot = await this.firestore
      .collection(Collections.Users)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return UserAdapter.toModel(doc.data() as UserEntity, doc.id);
  }

  async updateOrCreateUser(fcmToken: string): Promise<string> {
    const snapshot = await this.firestore
      .collection(Collections.Users)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({ fcmToken });
      return doc.id;
    }

    const docRef = await this.firestore
      .collection(Collections.Users)
      .add({ fcmToken });
    return docRef.id;
  }
}
