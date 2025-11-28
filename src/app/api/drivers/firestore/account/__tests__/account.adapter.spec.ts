import { AccountAdapter } from "../account.adapter";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { AccountEntity } from "../account.entity";

describe("AccountAdapter", () => {
  describe("toModel", () => {
    it("should convert AccountEntity to AccountModel and set id and account name", () => {
      const entity: AccountEntity = { account: "checking", balance: 100 };
      const id = "abc123";

      const result = AccountAdapter.toModel(entity, id);

      expect(result).toEqual({
        ...entity,
        id,
        account: "checking",
      });
    });
  });

  describe("toEntity", () => {
    it("should convert AccountModel to AccountEntity", () => {
      const model: AccountModel = {
        id: "abc123",
        account: "checking",
        balance: 200,
      };
      const result = AccountAdapter.toEntity(model);
      expect(result).toEqual({
        account: model.account,
        balance: model.balance,
      });
    });
  });
});
