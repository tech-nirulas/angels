import { WildcardPolicy } from '../can-access';
import { AnyPermission, Permission } from '../types';
export interface SidebarModuleDefinition {
    key: string;
    name: string;
    path: string;
    icon: string;
    order: number;
    requiredPermission: Permission;
}
export declare const MODULE_REGISTRY: SidebarModuleDefinition[];
/**
 * Longest-prefix wins: '/admin' matches every admin route as a prefix, so matching in array
 * order would resolve '/admin/orders' to the dashboard module.
 */
export declare function getModuleByPath(path: string): SidebarModuleDefinition | undefined;
export declare function getVisibleSidebarModules(userPermissions?: AnyPermission[], policy?: WildcardPolicy): SidebarModuleDefinition[];
