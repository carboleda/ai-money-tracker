import {
  UserDeviceModel,
  UserSettings,
} from "@/app/api/domain/user/model/user.model";

export interface UserDeviceEntity extends UserDeviceModel {
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface UserEntity extends FirebaseFirestore.DocumentData {
  email: string;
  devices?: UserDeviceEntity[];
  settings?: UserSettings;
}
