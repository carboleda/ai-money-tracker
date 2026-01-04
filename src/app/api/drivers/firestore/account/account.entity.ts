import { AccountType } from "@/app/api/domain/account/model/account.model";

export interface AccountEntity extends FirebaseFirestore.DocumentData {
  ref: string;
  name: string;
  balance: number;
  icon: string;
  type: AccountType;
  description?: string;
  isDeleted: boolean;
  // Legacy field for backward compatibility during migration
  account?: string;
}
