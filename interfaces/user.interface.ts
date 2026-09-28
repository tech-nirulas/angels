import { Role } from "./role.interface";
import { Root, RootPaginate } from "./root.interface";

/**
 * Mirrors the User Prisma model plus the relations getProfile() includes
 * (role, customer).
 */
export interface Customer {
  id: string;
  userId: string;
  birthday?: string | null;
  birthdayRewardsRedeemed: boolean;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent?: number | string | null;
  lastOrderDate?: string | null;
  emailSubscribed: boolean;
  smsSubscribed: boolean;
  birthdayRemindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Known mismatch (unresolved, tracked for the backend/product phase):
 * UpdateProfileDto accepts `avatar` and user.service types it, but there is
 * no avatar column on User or Customer and updateProfile() never adds it to
 * updatePayload — so an avatar upload is silently discarded and the backend
 * never returns the field. It is deliberately absent here; UI must not assume
 * the server can store one.
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  roleId?: string | null;
  role?: Role;
  customer?: Customer | null;
}

export type GetUserResponse = Root<User>;
export type GetAllUsersResponse = Root<User[]>;
export type GetAllUsersPaginatedResponse = RootPaginate<User[]>;

/** All three password endpoints return `{ message: string }` from user.service. */
export interface ChangePasswordResponse {
  message: string;
}
export interface ForgotPasswordResponse {
  message: string;
}
export interface ResetPasswordResponse {
  message: string;
}

/** Request bodies — mirror UpdateProfileDto/ChangePasswordDto/ForgotPasswordDto/ResetPasswordDto in the backend. */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}
