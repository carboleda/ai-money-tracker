import {
  Injectable,
  InjectRepository,
} from "@/app/api/decorators/tsyringe.decorator";
import { UserModel } from "../model/user.model";
import type { UserRepository } from "../repository/user.repository";

@Injectable()
export class NullifyStaleTokensService {
  private readonly logPrefix = `[${NullifyStaleTokensService.name}]`;

  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Nullifies stale FCM tokens in Firestore using a single WriteBatch.
   * Keeps the device record intact — only the fcmToken field is cleared.
   * No-op when the list is empty.
   */
  async execute(staleTokens: string[]): Promise<void> {
    if (!staleTokens.length) return;

    console.log(
      `${this.logPrefix} Nullifying ${staleTokens.length} stale token(s)...`,
    );

    await this.userRepository.nullifyStaleTokens(staleTokens);
  }
}
