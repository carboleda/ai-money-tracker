import { Injectable } from "@/app/api/decorators/tsyringe.decorator";
import { AccountModel } from "@/app/api/domain/account/model/account.model";

@Injectable()
export class CalculateBalanceService {
  async execute(accounts: AccountModel[]): Promise<number> {
    return accounts.reduce((acc, account) => acc + account.balance, 0);
  }
}
