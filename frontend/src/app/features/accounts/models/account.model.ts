export interface Account {
  id: number;
  userId: number;
  accountTypeId: number;
  accountTypeName: string;
  currencyId: number;
  currencyCode: string;
  name: string;
  description: string | null;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface CreateAccountRequest {
  userId: number;
  accountTypeId: number;
  currencyId: number;
  name: string;
  description: string | null;
  initialBalance: number;
}

export interface UpdateAccountRequest {
  accountTypeId: number;
  name: string;
  description: string | null;
  isActive: boolean;
}
