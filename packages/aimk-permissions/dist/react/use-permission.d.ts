import { AnyPermission, Permission } from '../types';
export declare function usePermission(userPermissions?: AnyPermission[]): {
    can: (permission: Permission) => boolean;
    permissions: AnyPermission[];
    isSuperAdmin: boolean;
};
