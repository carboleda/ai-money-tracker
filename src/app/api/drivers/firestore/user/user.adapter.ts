import { UserModel } from "@/app/api/domain/user/model/user.model";
import { UserEntity } from "./user.entity";

export class UserAdapter {
  static toModel(entity: UserEntity, id: string): UserModel {
    return {
      id,
      fcmToken: entity.fcmToken,
    };
  }
}
