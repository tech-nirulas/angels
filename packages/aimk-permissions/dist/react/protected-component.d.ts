import React from 'react';
import { AnyPermission, Permission } from '../types';
export interface ProtectedComponentProps {
    permission: Permission;
    userPermissions?: AnyPermission[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}
export declare function ProtectedComponent({ permission, userPermissions, fallback, children, }: ProtectedComponentProps): React.JSX.Element;
