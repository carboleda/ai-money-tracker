import type { AccountRepository } from "../repository/account.repository";
import { AccountModel } from "../model/account.model";
import { Service } from "@/app/api/domain/shared/ports/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { UpdateAccountInput } from "../ports/inbound/update-account.port";

@Injectable()
export class UpdateAccountService implements Service<UpdateAccountInput, void> {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(account: UpdateAccountInput): Promise<void> {
    return this.accountRepository.update(account);
  }
}
