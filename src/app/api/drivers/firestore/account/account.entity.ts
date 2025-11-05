export interface AccountEntity extends FirebaseFirestore.DocumentData {
  account: string;
  balance: number;
}
