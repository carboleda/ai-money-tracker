import type { AccountRepository } from "../repository/account.repository";
import { AccountModel } from "../model/account.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { CreateAccountInput } from "../ports/inbound/create-account.port";
import { DomainError } from "@/app/api/domain/shared/errors/domain.error";

@Injectable()
export class CreateAccountService
  implements Service<CreateAccountInput, string>
{
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(account: CreateAccountInput): Promise<string> {
    try {
      return await this.accountRepository.create(account);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("already exists")) {
        throw new DomainError(
          `Failed to create account: ${(error as Error).message}`,
          409
        );
      }
      throw new DomainError(`Failed to create account: ${message}`, 500);
    }
  }
}
