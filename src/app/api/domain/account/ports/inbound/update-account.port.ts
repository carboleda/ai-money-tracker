import { AccountModel } from "@/app/api/domain/account/model/account.model";

export type UpdateAccountInput = Partial<
  Omit<AccountModel, "id" | "isDeleted">
> & { id: string };
