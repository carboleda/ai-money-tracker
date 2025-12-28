import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import { UserModel } from "../model/user.model";
import type { UserRepository } from "../repository/user.repository";

@Injectable()
export class UpsertUserService implements Service<UserModel, string> {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: UserRepository
  ) { }

  async execute(user: UserModel): Promise<string> {
    return this.userRepository.updateOrCreateUser(user);
  }
}
