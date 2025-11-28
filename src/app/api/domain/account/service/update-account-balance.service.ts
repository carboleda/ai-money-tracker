import { AccountModel } from "../model/account.model";
import type { AccountRepository } from "../repository/account.repository";
import { Service } from "../../interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

@Injectable()
export class UpdateAccountBalanceService
  implements Service<AccountModel, AccountModel>
{
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(account: AccountModel): Promise<AccountModel> {
    const accountModel = await this.accountRepository.getAccountById(
      account.id
    );
    accountModel.balance += account.balance;
    // await this.accountRepository.updateAccount(accountModel);

    return accountModel;
  }
}
