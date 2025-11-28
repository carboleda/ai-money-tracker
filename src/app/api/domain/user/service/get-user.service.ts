import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { UserModel } from "../model/user.model";
import type { UserRepository } from "../repository/user.repository";
import { Service } from "../../interfaces/service.interface";

@Injectable()
export class GetUserService implements Service<never, UserModel | null> {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: UserRepository
  ) {}

  async execute(): Promise<UserModel | null> {
    return this.userRepository.getExistingUser();
  }
}
