export interface Contact {
  id: number;
  userId: number;
  contactTypeId: number;
  contactTypeName: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface CreateContactRequest {
  userId: number;
  contactTypeId: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export interface UpdateContactRequest {
  contactTypeId: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
}
