import {
  Injectable,
  Inject,
  InjectUserId,
} from "@/app/api/decorators/tsyringe.decorator";
import { Firestore } from "firebase-admin/firestore";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { UserModel } from "@/app/api/domain/user/model/user.model";
import { Collections } from "@/app/api/drivers/firestore/types";
import { UserAdapter } from "@/app/api/drivers/firestore/user/user.adapter";
import { UserEntity } from "./user.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";

@Injectable()
export class UserFirestoreRepository
  extends BaseFirestoreRepository
  implements UserRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserId() userId: string
  ) {
    super(Collections.Users, firestore, userId);
  }

  async getExistingUser(): Promise<UserModel | null> {
    const docRef = this.firestore
      .collection(Collections.Users)
      .doc(this.getUserId());
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return UserAdapter.toModel(doc.data() as UserEntity, doc.id);
  }

  async updateOrCreateUser(fcmToken: string): Promise<string> {
    const userId = this.getUserId();
    const docRef = this.firestore.collection(Collections.Users).doc(userId);
    const doc = await docRef.get();

    if (doc.exists) {
      await docRef.update({ fcmToken });
      return userId;
    }

    await docRef.set({ fcmToken });
    return userId;
  }

  async getAllUsers(): Promise<UserModel[]> {
    const snapshot = await this.firestore.collection(Collections.Users).get();

    return snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as UserEntity;
      return UserAdapter.toModel(entity, doc.id);
    });
  }
}
