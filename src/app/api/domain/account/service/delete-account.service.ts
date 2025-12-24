import type { AccountRepository } from "../repository/account.repository";
import { Service } from "../../interfaces/service.interface";
import {
  InjectRepository,
  Injectable,
} from "@/app/api/decorators/tsyringe.decorator";
import { AccountModel } from "../model/account.model";

@Injectable()
export class DeleteAccountService implements Service<string, void> {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(id: string): Promise<void> {
    return this.accountRepository.delete(id);
  }
}
