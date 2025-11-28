import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { UserModel } from "../model/user.model";
import type { UserRepository } from "../repository/user.repository";
import { Service } from "../../interfaces/service.interface";

@Injectable()
export class UpsertFcmTokenService implements Service<string, string> {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: UserRepository
  ) {}

  async execute(fcmToken: string): Promise<string> {
    return this.userRepository.updateOrCreateUser(fcmToken);
  }
}
