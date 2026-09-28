import { isWildcardPermission } from './permissions';
import { AnyPermission, Permission } from './types';

export interface WildcardPolicy {
  /** `'*'` or `'*:*'` grants everything. */
  global: boolean;
  /** `'subject:*'` grants every action within that subject. */
  subject: boolean;
  /** `'*:action'` grants that action across every subject. */
  action: boolean;
}

export const DEFAULT_WILDCARD_POLICY: WildcardPolicy = {
  global: true,
  subject: true,
  action: true,
};

/**
 * Action-scoped wildcards are opt-in. `*:read` silently reveals every read module across the
 * whole app, so a role that only meant to widen one subject should not receive it by accident.
 */
export const STRICT_WILDCARD_POLICY: WildcardPolicy = {
  global: true,
  subject: true,
  action: false,
};

export function canAccess(
  userPermissions: AnyPermission[],
  permission: Permission,
  policy: WildcardPolicy = DEFAULT_WILDCARD_POLICY,
): boolean {
  if (!Array.isArray(userPermissions) || !permission) {
    return false;
  }

  const perms = userPermissions as string[];

  if (policy.global && perms.some(isWildcardPermission)) {
    return true;
  }

  if (perms.includes(permission)) {
    return true;
  }

  if (permission.includes(':')) {
    const [subject, action] = permission.split(':');
    if (policy.subject && perms.includes(`${subject}:*`)) {
      return true;
    }
    if (policy.action && perms.includes(`*:${action}`)) {
      return true;
    }
  }

  return false;
}
