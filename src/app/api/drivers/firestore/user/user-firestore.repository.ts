import {
  Injectable,
  Inject,
  InjectUserContext,
} from "@/app/api/decorators/tsyringe.decorator";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import {
  UserDeviceModel,
  UserModel,
} from "@/app/api/domain/user/model/user.model";
import { Collections } from "@/app/api/drivers/firestore/types";
import { UserAdapter } from "@/app/api/drivers/firestore/user/user.adapter";
import { UserEntity, UserDeviceEntity } from "./user.entity";
import { BaseFirestoreRepository } from "@/app/api/drivers/firestore/base/base.firestore.repository";
import type { UserContext } from "@/app/api/context/user-context";

@Injectable()
export class UserFirestoreRepository
  extends BaseFirestoreRepository
  implements UserRepository
{
  constructor(
    @Inject(Firestore) firestore: Firestore,
    @InjectUserContext() userContext: UserContext
  ) {
    super(Collections.Users, firestore, userContext);
  }

  async getExistingUser(): Promise<UserModel | null> {
    const { id } = this.getUserContext();
    const docRef = this.firestore.collection(Collections.Users).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    return UserAdapter.toModel(doc.data() as UserEntity, doc.id);
  }

  async updateOrCreateUser(user: UserModel): Promise<string> {
    const { id, email } = this.getUserContext();
    const docRef = this.firestore.collection(Collections.Users).doc(id);
    const doc = await docRef.get();

    const entity = UserAdapter.toEntity({
      ...user,
      email,
    });

    if (doc.exists) {
      const existingEntity = { ...doc.data() } as UserEntity;
      entity.devices = this.mergeDevices(
        existingEntity.devices || [],
        user.devices || []
      );
    }

    entity.devices = this.addTimestampsToDevices(entity.devices || []);

    await docRef.set(entity, {
      merge: true,
    });

    return id;
  }

  async getAllUsers(): Promise<UserModel[]> {
    const snapshot = await this.firestore.collection(Collections.Users).get();

    return snapshot.docs.map((doc) => {
      const entity = { ...doc.data() } as UserEntity;
      return UserAdapter.toModel(entity, doc.id);
    });
  }

  private mergeDevices(
    existingDevices: UserDeviceEntity[],
    newDevices: UserDeviceModel[]
  ): UserDeviceEntity[] {
    if (!existingDevices) return newDevices as UserDeviceEntity[];

    // Update existing devices or keep them as-is
    const merged = existingDevices.map((ed) => {
      const updated = newDevices.find((nd) => nd.deviceId === ed.deviceId);
      return updated ? { ...ed, ...updated } : ed;
    });

    // Add new devices that don't exist in the existing list
    const newDeviceIds = new Set(existingDevices.map((d) => d.deviceId));
    const addedDevices = newDevices.filter(
      (device) => !newDeviceIds.has(device.deviceId)
    ) as UserDeviceEntity[];

    return [...merged, ...addedDevices];
  }

  private addTimestampsToDevices(
    devices: UserDeviceEntity[]
  ): UserDeviceEntity[] {
    return devices.map((device) => ({
      ...device,
      createdAt: device.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
    }));
  }
}
