import { PERMISSIONS } from './permissions';

type DeepValues<T> = T extends object ? DeepValues<T[keyof T]> : T;

export type Permission = DeepValues<typeof PERMISSIONS>;

/** `*`, `*:*`, `subject:*` and `*:action` patterns. */
export type WildcardPermission = '*' | '*:*' | `${string}:*` | `*:${string}`;

export type AnyPermission = Permission | WildcardPermission;
