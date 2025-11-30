import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import type { UserRepository } from "@/app/api/domain/user/repository/user.repository";
import { UserModel } from "@/app/api/domain/user/model/user.model";

@Injectable()
export class GetAllUsersService {
  constructor(
    @InjectRepository(UserModel) private readonly userRepository: UserRepository
  ) {}

  async execute(): Promise<UserModel[]> {
    return this.userRepository.getAllUsers();
  }
}
