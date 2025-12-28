import type { AccountRepository } from "../repository/account.repository";
import { AccountModel } from "../model/account.model";
import { Service } from "@/app/api/domain/shared/interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

@Injectable()
export class GetAllAccountsService implements Service<never, AccountModel[]> {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(): Promise<AccountModel[]> {
    return this.accountRepository.getAll();
  }
}
