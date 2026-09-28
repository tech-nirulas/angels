"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_REGISTRY = void 0;
exports.getModuleByPath = getModuleByPath;
exports.getVisibleSidebarModules = getVisibleSidebarModules;
const can_access_1 = require("../can-access");
const permissions_1 = require("../permissions");
exports.MODULE_REGISTRY = [
    { key: 'dashboard', name: 'Dashboard', path: '/admin', icon: 'Dashboard', order: 1, requiredPermission: permissions_1.PERMISSIONS.DASHBOARD.READ },
    { key: 'products', name: 'Products', path: '/admin/products', icon: 'ShoppingBag', order: 2, requiredPermission: permissions_1.PERMISSIONS.PRODUCT.READ },
    { key: 'modifiers', name: 'Modifiers & Add-ons', path: '/admin/modifiers', icon: 'Tune', order: 3, requiredPermission: permissions_1.PERMISSIONS.MODIFIER.READ },
    { key: 'inventory', name: 'Inventory & Batches', path: '/admin/inventory', icon: 'Inventory', order: 4, requiredPermission: permissions_1.PERMISSIONS.INVENTORY.READ },
    { key: 'customers', name: 'Customers', path: '/admin/customers', icon: 'People', order: 5, requiredPermission: permissions_1.PERMISSIONS.CUSTOMER.READ },
    { key: 'categories', name: 'Categories', path: '/admin/categories', icon: 'Category', order: 6, requiredPermission: permissions_1.PERMISSIONS.CATEGORY.READ },
    { key: 'cake-customizations', name: 'Cake Customizations', path: '/admin/cake-customizations', icon: 'Cake', order: 7, requiredPermission: permissions_1.PERMISSIONS.CAKE.READ },
    { key: 'reviews', name: 'Customer Reviews', path: '/admin/reviews', icon: 'RateReview', order: 8, requiredPermission: permissions_1.PERMISSIONS.REVIEW.READ },
    { key: 'users', name: 'Team Users & Roles', path: '/admin/users', icon: 'People', order: 9, requiredPermission: permissions_1.PERMISSIONS.USER.READ },
    { key: 'media', name: 'Media', path: '/admin/media', icon: 'Image', order: 10, requiredPermission: permissions_1.PERMISSIONS.MEDIA.READ },
    { key: 'outlets', name: 'Outlets', path: '/admin/outlets', icon: 'Storefront', order: 11, requiredPermission: permissions_1.PERMISSIONS.OUTLET.READ },
    { key: 'brands', name: 'Brands', path: '/admin/brands', icon: 'Category', order: 12, requiredPermission: permissions_1.PERMISSIONS.BRAND.READ },
    { key: 'legal-entities', name: 'Legal Entities', path: '/admin/legal-entities', icon: 'AccountBox', order: 13, requiredPermission: permissions_1.PERMISSIONS.LEGAL_ENTITY.READ },
    { key: 'outlet-prices', name: 'Outlet Prices', path: '/admin/outlet-prices', icon: 'PriceChange', order: 14, requiredPermission: permissions_1.PERMISSIONS.OUTLET_PRICE.READ },
    { key: 'orders', name: 'Orders', path: '/admin/orders', icon: 'ShoppingCart', order: 15, requiredPermission: permissions_1.PERMISSIONS.ORDER.READ },
    { key: 'payments', name: 'Payments', path: '/admin/payments', icon: 'Payments', order: 16, requiredPermission: permissions_1.PERMISSIONS.PAYMENT.READ },
    { key: 'discounts', name: 'Discounts', path: '/admin/discounts', icon: 'LocalOffer', order: 17, requiredPermission: permissions_1.PERMISSIONS.DISCOUNT.READ },
    { key: 'offers', name: 'Offers', path: '/admin/offers', icon: 'Discount', order: 18, requiredPermission: permissions_1.PERMISSIONS.OFFER.READ },
];
/**
 * Longest-prefix wins: '/admin' matches every admin route as a prefix, so matching in array
 * order would resolve '/admin/orders' to the dashboard module.
 */
function getModuleByPath(path) {
    return exports.MODULE_REGISTRY.filter((m) => path === m.path || path.startsWith(`${m.path}/`)).sort((a, b) => b.path.length - a.path.length)[0];
}
function getVisibleSidebarModules(userPermissions = [], policy) {
    if (!Array.isArray(userPermissions))
        return [];
    return exports.MODULE_REGISTRY.filter((module) => (0, can_access_1.canAccess)(userPermissions, module.requiredPermission, policy)).sort((a, b) => a.order - b.order);
}
/**
 * Load-time contract check (principle P2). A registry entry pointing at a permission string that
 * no longer exists compiles fine but silently hides the module from every non-wildcard role, so
 * fail fast at import instead.
 */
function assertRegistryIntegrity() {
    const seenPaths = new Set();
    const seenKeys = new Set();
    for (const module of exports.MODULE_REGISTRY) {
        if (!(0, permissions_1.isValidPermission)(module.requiredPermission)) {
            throw new Error(`[@aimk/permissions] Module '${module.key}' requires unknown permission ` +
                `'${module.requiredPermission}'. Add it to PERMISSIONS.`);
        }
        if (seenPaths.has(module.path)) {
            throw new Error(`[@aimk/permissions] Duplicate module path '${module.path}' in registry.`);
        }
        if (seenKeys.has(module.key)) {
            throw new Error(`[@aimk/permissions] Duplicate module key '${module.key}' in registry.`);
        }
        seenPaths.add(module.path);
        seenKeys.add(module.key);
    }
}
assertRegistryIntegrity();
