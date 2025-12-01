import { UserDeviceModel } from "@/app/api/domain/user/model/user.model";

export interface UserDeviceEntity extends UserDeviceModel {
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface UserEntity extends FirebaseFirestore.DocumentData {
  devices?: UserDeviceEntity[];
}
