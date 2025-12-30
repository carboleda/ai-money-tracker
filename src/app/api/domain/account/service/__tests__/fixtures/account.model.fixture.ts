import {
  AccountModel,
  AccountType,
} from "@/app/api/domain/account/model/account.model";

const accountModelFixture = {
  name: "Checking",
  type: AccountType.SAVING,
  balance: 1000,
  icon: "🏦",
  isDeleted: false,
};

export const getSeveralAccountModels = (
  count: number,
  partialAccountModels: Array<Partial<AccountModel>>
): AccountModel[] => {
  return Array.from(
    { length: count },
    (_, index) =>
      new AccountModel({
        ...accountModelFixture,
        id: (index + 1).toString(),
        ref: `account-${index + 1}`,
        ...partialAccountModels[index % partialAccountModels.length],
      })
  );
};
