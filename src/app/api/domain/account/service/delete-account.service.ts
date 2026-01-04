import type { AccountRepository } from "../repository/account.repository";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { AccountModel } from "../model/account.model";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

@Injectable()
export class DeleteAccountService implements Service<string, void> {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(id: string): Promise<void> {
    try {
      return await this.accountRepository.delete(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("not found")) {
        throw new DomainError(
          `Failed to delete account: ${(error as Error).message}`,
          404
        );
      }
      throw new DomainError(`Failed to delete account: ${message}`, 500);
    }
  }
}
