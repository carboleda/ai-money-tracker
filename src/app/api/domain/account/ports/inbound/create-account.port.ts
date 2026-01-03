import { AccountModel } from "@/app/api/domain/account/model/account.model";

export type CreateAccountInput = Omit<AccountModel, "id" | "isDeleted">;
