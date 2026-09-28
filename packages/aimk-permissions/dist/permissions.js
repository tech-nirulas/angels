"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PERMISSIONS = exports.ALL_WILDCARDS = exports.WILDCARD_PERMISSION = exports.PERMISSION_MATRIX = exports.API_ONLY_SUBJECTS = exports.PERMISSIONS = void 0;
exports.isValidPermission = isValidPermission;
exports.isWildcardPermission = isWildcardPermission;
exports.sanitizePermissions = sanitizePermissions;
exports.PERMISSIONS = {
    DASHBOARD: { READ: 'dashboard:read' },
    PRODUCT: { READ: 'product:read', CREATE: 'product:create', UPDATE: 'product:update', DELETE: 'product:delete' },
    CATEGORY: { READ: 'category:read', CREATE: 'category:create', UPDATE: 'category:update', DELETE: 'category:delete' },
    BRAND: { READ: 'brand:read', CREATE: 'brand:create', UPDATE: 'brand:update', DELETE: 'brand:delete' },
    INVENTORY: { READ: 'inventory:read', CREATE: 'inventory:create', UPDATE: 'inventory:update', DELETE: 'inventory:delete' },
    ORDER: { READ: 'order:read', UPDATE_STATUS: 'order:update-status', ASSIGN_OUTLET: 'order:assign-outlet' },
    PAYMENT: { READ: 'payment:read', REFUND: 'payment:refund' },
    DISCOUNT: { READ: 'discount:read', CREATE: 'discount:create', UPDATE: 'discount:update', DELETE: 'discount:delete' },
    OFFER: { READ: 'offer:read', CREATE: 'offer:create', UPDATE: 'offer:update', DELETE: 'offer:delete' },
    REVIEW: { READ: 'review:read', MODERATE: 'review:moderate', DELETE: 'review:delete' },
    CAKE: { READ: 'cake:read', UPDATE: 'cake:update' },
    OUTLET: { READ: 'outlet:read', CREATE: 'outlet:create', UPDATE: 'outlet:update', DELETE: 'outlet:delete' },
    OUTLET_PRICE: { READ: 'outlet-price:read', CREATE: 'outlet-price:create', UPDATE: 'outlet-price:update', DELETE: 'outlet-price:delete' },
    MEDIA: { READ: 'media:read', CREATE: 'media:create', UPDATE: 'media:update', DELETE: 'media:delete' },
    LEGAL_ENTITY: { READ: 'legal-entity:read', CREATE: 'legal-entity:create', UPDATE: 'legal-entity:update', DELETE: 'legal-entity:delete' },
    USER: { READ: 'user:read', CREATE: 'user:create', UPDATE: 'user:update', DELETE: 'user:delete', MANAGE_ROLES: 'user:manage-roles' },
    CUSTOMER: { READ: 'customer:read', UPDATE: 'customer:update', UPDATE_LOYALTY: 'customer:update-loyalty' },
    DELIVERY_ZONE: { READ: 'delivery-zone:read', CREATE: 'delivery-zone:create', UPDATE: 'delivery-zone:update', DELETE: 'delivery-zone:delete' },
    SERVICEABLE_AREA: { READ: 'serviceable-area:read', CREATE: 'serviceable-area:create', UPDATE: 'serviceable-area:update', DELETE: 'serviceable-area:delete' },
    MODIFIER: { READ: 'modifier:read', CREATE: 'modifier:create', UPDATE: 'modifier:update', DELETE: 'modifier:delete' },
};
/**
 * Subjects that gate API behaviour but have no dedicated admin page, so they intentionally have
 * no MODULE_REGISTRY entry. They are still grantable in the permission editor and enforced by the
 * backend guard. Keep this list in sync if an admin page is ever added for them.
 */
exports.API_ONLY_SUBJECTS = ['delivery-zone', 'serviceable-area'];
function titleCase(value) {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
const PERMISSION_LABELS = {
    read: 'Read',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    'update-status': 'Update status',
    'assign-outlet': 'Assign outlet',
    refund: 'Refund',
    moderate: 'Moderate',
    'manage-roles': 'Manage roles',
    'update-loyalty': 'Update loyalty',
};
exports.PERMISSION_MATRIX = Object.keys(exports.PERMISSIONS).map((subjectKey) => {
    const subject = exports.PERMISSIONS[subjectKey];
    const key = subjectKey.toLowerCase().replace(/_/g, '-');
    return {
        key,
        label: PERMISSION_LABELS[key] ?? titleCase(key),
        hasAdminPage: !exports.API_ONLY_SUBJECTS.includes(key),
        actions: Object.keys(subject).map((actionKey) => ({
            key: String(actionKey).toLowerCase(),
            label: PERMISSION_LABELS[String(actionKey).toLowerCase()] ?? titleCase(String(actionKey)),
            permission: subject[actionKey],
        })),
    };
});
exports.WILDCARD_PERMISSION = '*';
exports.ALL_WILDCARDS = ['*', '*:*'];
exports.ALL_PERMISSIONS = Object.values(exports.PERMISSIONS).flatMap((subject) => Object.values(subject));
const PERMISSION_SET = new Set(exports.ALL_PERMISSIONS);
function isValidPermission(value) {
    return typeof value === 'string' && PERMISSION_SET.has(value);
}
function isWildcardPermission(value) {
    return typeof value === 'string' && exports.ALL_WILDCARDS.includes(value);
}
/**
 * Validates a client-supplied permission list, dropping wildcards and unknown strings.
 * Call this at every write boundary so a typo fails closed instead of granting nothing.
 */
function sanitizePermissions(input) {
    if (!Array.isArray(input))
        return [];
    const seen = new Set();
    for (const entry of input) {
        if (isValidPermission(entry) || isWildcardPermission(entry))
            seen.add(entry);
    }
    return Array.from(seen);
}
