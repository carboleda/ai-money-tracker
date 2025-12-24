import type { AccountRepository } from "../repository/account.repository";
import { AccountModel, CreateAccountInput } from "../model/account.model";
import { Service } from "../../interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

@Injectable()
export class CreateAccountService implements Service<CreateAccountInput, AccountModel> {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(input: CreateAccountInput): Promise<AccountModel> {
    return this.accountRepository.create(input);
  }
}
