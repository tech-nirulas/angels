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
export declare function getVisibleSidebarModules(userPermissions?: AnyPermission[]): SidebarModuleDefinition[];
