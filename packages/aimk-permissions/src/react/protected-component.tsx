import React from 'react';
import { canAccess } from '../can-access';
import { AnyPermission, Permission } from '../types';

export interface ProtectedComponentProps {
  permission: Permission;
  userPermissions?: AnyPermission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedComponent({
  permission,
  userPermissions = [],
  fallback = null,
  children,
}: ProtectedComponentProps) {
  const hasAccess = canAccess(userPermissions, permission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
