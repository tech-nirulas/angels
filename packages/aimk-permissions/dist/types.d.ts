import { PERMISSIONS } from './permissions';
type DeepValues<T> = T extends object ? DeepValues<T[keyof T]> : T;
export type Permission = DeepValues<typeof PERMISSIONS>;
export type WildcardPermission = '*';
export type AnyPermission = Permission | WildcardPermission;
export {};
