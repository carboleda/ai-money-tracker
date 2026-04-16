import { UserModel } from "../model/user.model";

export interface UserRepository {
  getExistingUser(): Promise<UserModel | null>;
  updateOrCreateUser(user: UserModel): Promise<string>;
  getAllUsers(): Promise<UserModel[]>;
  /**
   * Nullifies the fcmToken field for every device whose token matches one
   * of the provided values. The device record itself is kept intact.
   */
  nullifyStaleTokens(fcmTokens: string[]): Promise<void>;
}
