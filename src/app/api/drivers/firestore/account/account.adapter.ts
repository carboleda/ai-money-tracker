import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { AccountEntity } from "./account.entity";

export class AccountAdapter {
  static toModel(entity: AccountEntity, id: string): AccountModel {
    return {
      ...entity,
      id,
    };
  }

  static toEntity(model: AccountModel): AccountEntity {
    return {
      account: model.account,
      balance: model.balance,
    };
  }
}
