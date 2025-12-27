import type { AccountRepository } from "../repository/account.repository";
import { AccountModel, CreateAccountInput } from "../model/account.model";
import { Service } from "../../interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

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
