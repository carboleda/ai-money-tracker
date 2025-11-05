import { AccountAdapter } from "../account.adapter";
import { Utilities } from "@/app/api/helpers/utils";
import { AccountModel } from "@/app/api/domain/account/model/account.model";
import { AccountEntity } from "../account.entity";

describe("AccountAdapter", () => {
  describe("toModel", () => {
    it("should convert AccountEntity to AccountModel and set id and account name", () => {
      const entity: AccountEntity = { account: "checking", balance: 100 };
      const id = "abc123";
      const mockAccountName = "Checking Account";
      jest.spyOn(Utilities, "getAccountName").mockReturnValue(mockAccountName);

      const result = AccountAdapter.toModel(entity, id);

      expect(result).toEqual({
        ...entity,
        id,
        account: mockAccountName,
      });
      expect(Utilities.getAccountName).toHaveBeenCalledWith(entity.account);
    });
  });

  describe("toEntity", () => {
    it("should convert AccountModel to AccountEntity", () => {
      const model: AccountModel = {
        id: "abc123",
        account: "Checking Account",
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
