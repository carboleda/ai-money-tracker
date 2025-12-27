import type { AccountRepository } from "../repository/account.repository";
import { AccountModel, UpdateAccountInput } from "../model/account.model";
import { Service } from "../../interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

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
