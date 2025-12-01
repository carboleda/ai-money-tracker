export interface UserDeviceModel {
  deviceId: string;
  deviceName: string;
  fcmToken?: string;
}

export class UserModel {
  public id: string;
  public email: string;
  public devices?: UserDeviceModel[];

  constructor(params: {
    id: string;
    email: string;
    devices: UserDeviceModel[];
  }) {
    this.id = params.id;
    this.email = params.email;
    this.devices = params.devices;
  }
}
