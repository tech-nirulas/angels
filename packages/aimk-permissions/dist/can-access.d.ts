import { AnyPermission, Permission } from './types';
export interface WildcardPolicy {
    /** `'*'` or `'*:*'` grants everything. */
    global: boolean;
    /** `'subject:*'` grants every action within that subject. */
    subject: boolean;
    /** `'*:action'` grants that action across every subject. */
    action: boolean;
}
export declare const DEFAULT_WILDCARD_POLICY: WildcardPolicy;
/**
 * Action-scoped wildcards are opt-in. `*:read` silently reveals every read module across the
 * whole app, so a role that only meant to widen one subject should not receive it by accident.
 */
export declare const STRICT_WILDCARD_POLICY: WildcardPolicy;
export declare function canAccess(userPermissions: AnyPermission[], permission: Permission, policy?: WildcardPolicy): boolean;
