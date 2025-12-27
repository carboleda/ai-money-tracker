import type { AccountRepository } from "../repository/account.repository";
import { AccountModel } from "../model/account.model";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

@Injectable()
export class ValidateAccountService {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(
    sourceAccount: string,
    destinationAccount?: string
  ): Promise<void> {
    // Check sourceAccount
    const sourceAccountModel = await this.accountRepository.getAccountByRef(
      sourceAccount
    );
    if (!sourceAccountModel) {
      throw new Error(
        `Source account '${sourceAccount}' does not exist or has been deleted`
      );
    }

    // Check destinationAccount if provided
    if (destinationAccount) {
      const destAccountModel = await this.accountRepository.getAccountByRef(
        destinationAccount
      );
      if (!destAccountModel) {
        throw new Error(
          `Destination account '${destinationAccount}' does not exist or has been deleted`
        );
      }
    }
  }
}
