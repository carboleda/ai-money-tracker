import { UserModel } from "../../../model/user.model";

export const createUserModelFixture = (overrides?: {
  id?: string;
  email?: string;
  devices?: Array<{ deviceId: string; deviceName: string; fcmToken?: string }>;
}): UserModel => {
  return new UserModel({
    id: overrides?.id ?? "user1",
    email: overrides?.email ?? "user@test.com",
    devices: overrides?.devices ?? [
      { deviceId: "dev1", deviceName: "Test Device", fcmToken: "token1" },
    ],
  });
};
