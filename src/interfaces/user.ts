export interface UserDevice {
  deviceId: string;
  deviceName: string;
  fcmToken?: string;
}

export interface UserEntity {
  devices: UserDevice[];
}

export interface User extends UserEntity {
  id?: string;
}
