"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = void 0;
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
};
