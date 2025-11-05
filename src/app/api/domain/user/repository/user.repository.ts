import { UserModel } from "../model/user.model";

export interface UserRepository {
  getExistingUser(): Promise<UserModel | null>;
  updateOrCreateUser(fcmToken: string): Promise<string>;
}
