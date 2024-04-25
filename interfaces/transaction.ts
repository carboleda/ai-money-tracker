export interface Transaction {
  id: string;
  description: string;
  type: string;
  category: string;
  sourceAccount: string;
  destinationAccount?: string;
  amount: number;
}
