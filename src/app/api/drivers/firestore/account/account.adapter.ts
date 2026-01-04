import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { AccountEntity } from "./account.entity";

export class AccountAdapter {
  static toModel(entity: AccountEntity, id: string): AccountModel {
    return {
      id,
      ref: entity.ref,
      name: entity.name,
      balance: entity.balance,
      icon: entity.icon,
      type: entity.type,
      description: entity.description,
      isDeleted: entity.isDeleted ?? false,
    };
  }

  static toEntity(model: AccountModel): AccountEntity {
    return {
      ref: model.ref,
      name: model.name,
      balance: model.balance,
      icon: model.icon,
      type: model.type,
      description: model.description,
      isDeleted: model.isDeleted ?? false,
    };
  }
}
