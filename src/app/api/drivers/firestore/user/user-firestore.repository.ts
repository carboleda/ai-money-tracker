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

@Injectable()
export class UserFirestoreRepository implements UserRepository {
  constructor(
    @Inject(Firestore) private readonly firestore: Firestore,
    @InjectUserId() private readonly userId: string
  ) {}

  async getExistingUser(): Promise<UserModel | null> {
    const docRef = this.firestore
      .collection(Collections.Users)
      .doc(this.userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return UserAdapter.toModel(doc.data() as UserEntity, doc.id);
  }

  async updateOrCreateUser(fcmToken: string): Promise<string> {
    const docRef = this.firestore
      .collection(Collections.Users)
      .doc(this.userId);
    const doc = await docRef.get();

    if (doc.exists) {
      await docRef.update({ fcmToken });
      return this.userId;
    }

    await docRef.set({ fcmToken });
    return this.userId;
  }
}
