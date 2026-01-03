import type { AccountRepository } from "../repository/account.repository";
import { AccountModel } from "../model/account.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { CreateAccountInput } from "../ports/inbound/create-account.port";

@Injectable()
export class CreateAccountService
  implements Service<CreateAccountInput, string>
{
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(account: CreateAccountInput): Promise<string> {
    return this.accountRepository.create(account);
  }
}
