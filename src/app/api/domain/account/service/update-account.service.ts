import type { AccountRepository } from "../repository/account.repository";
import { AccountModel, UpdateAccountInput } from "../model/account.model";
import { Service } from "../../interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";

interface UpdateAccountServiceInput {
  id: string;
  data: UpdateAccountInput;
}

@Injectable()
export class UpdateAccountService
  implements Service<UpdateAccountServiceInput, AccountModel>
{
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(input: UpdateAccountServiceInput): Promise<AccountModel> {
    return this.accountRepository.update(input.id, input.data);
  }
}
