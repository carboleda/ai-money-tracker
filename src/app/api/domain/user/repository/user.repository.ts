import { UserModel } from "../model/user.model";

export interface UserRepository {
  getExistingUser(): Promise<UserModel | null>;
  updateOrCreateUser(user: UserModel): Promise<string>;
  getAllUsers(): Promise<UserModel[]>;
}
