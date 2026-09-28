import { canAccess } from '../can-access';
import { AnyPermission, Permission } from '../types';

export function usePermission(userPermissions: AnyPermission[] = []) {
  const isSuperAdmin = Array.isArray(userPermissions) && userPermissions.includes('*');

  const can = (permission: Permission): boolean => {
    return canAccess(userPermissions, permission);
  };

  return {
    can,
    permissions: userPermissions,
    isSuperAdmin,
  };
}
