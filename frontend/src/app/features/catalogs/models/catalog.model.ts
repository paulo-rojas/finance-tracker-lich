export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface AccountType {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface ContactType {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface TransactionType {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface Category {
  id: number;
  parentCategoryId: number | null;
  transactionTypeId: number;
  transactionTypeCode: string;
  name: string;
  description: string | null;
  isActive: boolean;
}
