import { AccountAdapter } from "../account.adapter";
import {
  AccountModel,
  AccountType,
} from "@/app/api/domain/account/model/account.model";
import { AccountEntity } from "../account.entity";

describe("AccountAdapter", () => {
  describe("toModel", () => {
    it("should convert AccountEntity to AccountModel and set id and account name", () => {
      const entity: AccountEntity = {
        ref: "account-1",
        name: "checking",
        type: AccountType.SAVING,
        description: "Personal checking account",
        icon: "🏦",
        isDeleted: false,
        balance: 100,
      };
      const id = "abc123";

      const result = AccountAdapter.toModel(entity, id);

      expect(result).toEqual({
        ...entity,
        id,
      });
    });
  });

  describe("toEntity", () => {
    it("should convert AccountModel to AccountEntity", () => {
      const model: AccountModel = {
        id: "abc123",
        ref: "account-1",
        name: "checking",
        type: AccountType.CREDIT,
        description: "Personal checking account",
        icon: "🏦",
        isDeleted: false,
        balance: 200,
      };

      const result = AccountAdapter.toEntity(model);

      expect(result).toEqual({
        ref: model.ref,
        name: model.name,
        type: model.type,
        description: model.description,
        icon: model.icon,
        isDeleted: model.isDeleted,
        balance: model.balance,
      });
    });
  });
});
