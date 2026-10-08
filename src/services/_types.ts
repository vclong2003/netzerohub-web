export enum EAccountRole {
  User = "User",
  Admin = "Admin",
}

export interface IAccount {
  id: number;
  code: string;
  email: string;
  role: EAccountRole;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}
