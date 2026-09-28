import type { Permission } from './types';
export declare const PERMISSIONS: {
    readonly DASHBOARD: {
        readonly READ: "dashboard:read";
    };
    readonly PRODUCT: {
        readonly READ: "product:read";
        readonly CREATE: "product:create";
        readonly UPDATE: "product:update";
        readonly DELETE: "product:delete";
    };
    readonly CATEGORY: {
        readonly READ: "category:read";
        readonly CREATE: "category:create";
        readonly UPDATE: "category:update";
        readonly DELETE: "category:delete";
    };
    readonly BRAND: {
        readonly READ: "brand:read";
        readonly CREATE: "brand:create";
        readonly UPDATE: "brand:update";
        readonly DELETE: "brand:delete";
    };
    readonly INVENTORY: {
        readonly READ: "inventory:read";
        readonly CREATE: "inventory:create";
        readonly UPDATE: "inventory:update";
        readonly DELETE: "inventory:delete";
    };
    readonly ORDER: {
        readonly READ: "order:read";
        readonly UPDATE_STATUS: "order:update-status";
        readonly ASSIGN_OUTLET: "order:assign-outlet";
    };
    readonly PAYMENT: {
        readonly READ: "payment:read";
        readonly REFUND: "payment:refund";
    };
    readonly DISCOUNT: {
        readonly READ: "discount:read";
        readonly CREATE: "discount:create";
        readonly UPDATE: "discount:update";
        readonly DELETE: "discount:delete";
    };
    readonly OFFER: {
        readonly READ: "offer:read";
        readonly CREATE: "offer:create";
        readonly UPDATE: "offer:update";
        readonly DELETE: "offer:delete";
    };
    readonly REVIEW: {
        readonly READ: "review:read";
        readonly MODERATE: "review:moderate";
        readonly DELETE: "review:delete";
    };
    readonly CAKE: {
        readonly READ: "cake:read";
        readonly UPDATE: "cake:update";
    };
    readonly OUTLET: {
        readonly READ: "outlet:read";
        readonly CREATE: "outlet:create";
        readonly UPDATE: "outlet:update";
        readonly DELETE: "outlet:delete";
    };
    readonly OUTLET_PRICE: {
        readonly READ: "outlet-price:read";
        readonly CREATE: "outlet-price:create";
        readonly UPDATE: "outlet-price:update";
        readonly DELETE: "outlet-price:delete";
    };
    readonly MEDIA: {
        readonly READ: "media:read";
        readonly CREATE: "media:create";
        readonly UPDATE: "media:update";
        readonly DELETE: "media:delete";
    };
    readonly LEGAL_ENTITY: {
        readonly READ: "legal-entity:read";
        readonly CREATE: "legal-entity:create";
        readonly UPDATE: "legal-entity:update";
        readonly DELETE: "legal-entity:delete";
    };
    readonly USER: {
        readonly READ: "user:read";
        readonly CREATE: "user:create";
        readonly UPDATE: "user:update";
        readonly DELETE: "user:delete";
        readonly MANAGE_ROLES: "user:manage-roles";
    };
    readonly CUSTOMER: {
        readonly READ: "customer:read";
        readonly UPDATE: "customer:update";
        readonly UPDATE_LOYALTY: "customer:update-loyalty";
    };
    readonly DELIVERY_ZONE: {
        readonly READ: "delivery-zone:read";
        readonly CREATE: "delivery-zone:create";
        readonly UPDATE: "delivery-zone:update";
        readonly DELETE: "delivery-zone:delete";
    };
    readonly SERVICEABLE_AREA: {
        readonly READ: "serviceable-area:read";
        readonly CREATE: "serviceable-area:create";
        readonly UPDATE: "serviceable-area:update";
        readonly DELETE: "serviceable-area:delete";
    };
    readonly MODIFIER: {
        readonly READ: "modifier:read";
        readonly CREATE: "modifier:create";
        readonly UPDATE: "modifier:update";
        readonly DELETE: "modifier:delete";
    };
};
/**
 * Subjects that gate API behaviour but have no dedicated admin page, so they intentionally have
 * no MODULE_REGISTRY entry. They are still grantable in the permission editor and enforced by the
 * backend guard. Keep this list in sync if an admin page is ever added for them.
 */
export declare const API_ONLY_SUBJECTS: readonly ["delivery-zone", "serviceable-area"];
export interface PermissionActionDefinition {
    key: string;
    label: string;
    permission: Permission;
}
export interface PermissionSubjectDefinition {
    key: string;
    label: string;
    /** False when the subject gates the API but has no admin page of its own. */
    hasAdminPage: boolean;
    actions: PermissionActionDefinition[];
}
export declare const PERMISSION_MATRIX: PermissionSubjectDefinition[];
export declare const WILDCARD_PERMISSION = "*";
export declare const ALL_WILDCARDS: readonly ["*", "*:*"];
export declare const ALL_PERMISSIONS: readonly Permission[];
export declare function isValidPermission(value: unknown): value is Permission;
export declare function isWildcardPermission(value: unknown): boolean;
/**
 * Validates a client-supplied permission list, dropping wildcards and unknown strings.
 * Call this at every write boundary so a typo fails closed instead of granting nothing.
 */
export declare function sanitizePermissions(input: unknown): string[];
