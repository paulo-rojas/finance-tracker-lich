export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  passwordHash: string;
}
