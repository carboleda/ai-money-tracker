import { UserModel, UserSettings } from "../model/user.model";

export interface UserRepository {
  getExistingUser(): Promise<UserModel | null>;
  updateOrCreateUser(user: UserModel): Promise<string>;
  getAllUsers(): Promise<UserModel[]>;
  /**
   * Nullifies the fcmToken field for every device whose token matches one
   * of the provided values. The device record itself is kept intact.
   */
  nullifyStaleTokens(fcmTokens: string[]): Promise<void>;
  /**
   * Replaces the user's settings map wholesale with the given value, so
   * keys omitted by the caller are actually removed rather than merged.
   */
  updateUserSettings(settings: UserSettings): Promise<UserSettings>;
}
