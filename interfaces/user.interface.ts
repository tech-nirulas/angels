import { Role } from "./role.interface";
import { Root, RootPaginate } from "./root.interface";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  roleId?: string;
  role?: Role;
}

export type GetUserResponse = Root<User>;
export type GetAllUsersResponse = Root<User[]>;
export type GetAllUsersPaginatedResponse = RootPaginate<User[]>;
export interface ChangePasswordResponse {
  message: string;
}