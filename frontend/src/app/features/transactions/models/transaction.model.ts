export type TransactionTypeCode = 'INCOME' | 'EXPENSE' | 'INTERNAL_TRANSFER';

export interface Transaction {
  id: number;
  userId: number;
  transactionTypeCode: TransactionTypeCode;
  categoryId: number | null;
  categoryName: string | null;
  sourceAccountId: number | null;
  sourceAccountName: string | null;
  destinationAccountId: number | null;
  destinationAccountName: string | null;
  sourceContactId: number | null;
  sourceContactName: string | null;
  destinationContactId: number | null;
  destinationContactName: string | null;
  amount: number;
  currencyId: number;
  currencyCode: string;
  transactionDate: string;
  description: string | null;
  referenceCode: string | null;
  createdAt: string;
}

export interface SaveTransactionRequest {
  userId: number;
  transactionTypeCode: TransactionTypeCode;
  categoryId: number | null;
  sourceAccountId: number | null;
  destinationAccountId: number | null;
  sourceContactId: number | null;
  destinationContactId: number | null;
  amount: number;
  currencyId: number;
  transactionDate: string | null;
  description: string | null;
  referenceCode: string | null;
}
