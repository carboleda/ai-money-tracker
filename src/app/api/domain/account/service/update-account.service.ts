import type { AccountRepository } from "../repository/account.repository";
import { AccountModel } from "../model/account.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { UpdateAccountInput } from "../ports/inbound/update-account.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

@Injectable()
export class UpdateAccountService implements Service<UpdateAccountInput, void> {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(account: UpdateAccountInput): Promise<void> {
    try {
      return await this.accountRepository.update(account);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("not found")) {
        throw new DomainError(
          `Failed to update account: ${(error as Error).message}`,
          404
        );
      }
      throw new DomainError(`Failed to update account: ${message}`, 500);
    }
  }
}
