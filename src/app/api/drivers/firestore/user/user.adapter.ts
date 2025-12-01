import { UserModel } from "@/app/api/domain/user/model/user.model";
import { UserEntity } from "./user.entity";

export class UserAdapter {
  static toModel(entity: UserEntity, id: string): UserModel {
    return {
      id,
      email: id,
      devices: entity.devices?.map((deviceEntity) => ({
        deviceId: deviceEntity.deviceId,
        deviceName: deviceEntity.deviceName,
        fcmToken: deviceEntity.fcmToken,
      })),
    };
  }

  static toEntity(model: UserModel): UserEntity {
    return {
      devices: model.devices?.map((deviceModel) => ({
        deviceId: deviceModel.deviceId,
        deviceName: deviceModel.deviceName,
        fcmToken: deviceModel.fcmToken,
      })),
    };
  }
}
