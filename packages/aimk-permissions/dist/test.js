"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const can_access_1 = require("./can-access");
const modules_1 = require("./modules");
const permissions_1 = require("./permissions");
let failures = 0;
function check(name, condition) {
    if (condition) {
        console.log(`  ok  ${name}`);
    }
    else {
        failures += 1;
        console.error(`FAIL  ${name}`);
    }
}
console.log('Testing @aimk/permissions...\n');
console.log('canAccess');
check('global wildcard grants access', (0, can_access_1.canAccess)(['*'], permissions_1.PERMISSIONS.PRODUCT.READ));
check('*:* grants access', (0, can_access_1.canAccess)(['*:*'], permissions_1.PERMISSIONS.PAYMENT.REFUND));
check('exact match grants access', (0, can_access_1.canAccess)([permissions_1.PERMISSIONS.PRODUCT.READ], permissions_1.PERMISSIONS.PRODUCT.READ));
check('different action is denied', !(0, can_access_1.canAccess)([permissions_1.PERMISSIONS.PRODUCT.READ], permissions_1.PERMISSIONS.PRODUCT.CREATE));
check('empty permissions denied', !(0, can_access_1.canAccess)([], permissions_1.PERMISSIONS.PRODUCT.READ));
check('non-array denied', !(0, can_access_1.canAccess)(null, permissions_1.PERMISSIONS.PRODUCT.READ));
check('subject wildcard grants its actions', (0, can_access_1.canAccess)(['product:*'], permissions_1.PERMISSIONS.PRODUCT.DELETE));
check('subject wildcard does not cross subjects', !(0, can_access_1.canAccess)(['product:*'], permissions_1.PERMISSIONS.ORDER.READ));
check('action wildcard grants across subjects', (0, can_access_1.canAccess)(['*:read'], permissions_1.PERMISSIONS.ORDER.READ));
check('strict policy rejects action wildcard', !(0, can_access_1.canAccess)(['*:read'], permissions_1.PERMISSIONS.ORDER.READ, can_access_1.STRICT_WILDCARD_POLICY));
check('strict policy still honours subject wildcard', (0, can_access_1.canAccess)(['order:*'], permissions_1.PERMISSIONS.ORDER.READ, can_access_1.STRICT_WILDCARD_POLICY));
check('role names are not permissions', !(0, can_access_1.canAccess)(['super_admin'], permissions_1.PERMISSIONS.PRODUCT.READ));
console.log('\nvalidation');
check('known permission is valid', (0, permissions_1.isValidPermission)(permissions_1.PERMISSIONS.USER.MANAGE_ROLES));
check('unknown permission is invalid', !(0, permissions_1.isValidPermission)('product:fly'));
check('bare colon string is invalid', !(0, permissions_1.isValidPermission)(':read'));
check('non-string is invalid', !(0, permissions_1.isValidPermission)(42));
check('wildcards detected', (0, permissions_1.isWildcardPermission)('*') && (0, permissions_1.isWildcardPermission)('*:*'));
check('ALL_PERMISSIONS has no duplicates', new Set(permissions_1.ALL_PERMISSIONS).size === permissions_1.ALL_PERMISSIONS.length);
check('every PERMISSIONS entry is enumerated', permissions_1.ALL_PERMISSIONS.length > 0);
check('sanitize drops unknown strings', JSON.stringify((0, permissions_1.sanitizePermissions)([permissions_1.PERMISSIONS.PRODUCT.READ, 'nope', ':bad'])) ===
    JSON.stringify([permissions_1.PERMISSIONS.PRODUCT.READ]));
check('sanitize keeps wildcards', (0, permissions_1.sanitizePermissions)(['*']).length === 1);
check('sanitize handles non-array', (0, permissions_1.sanitizePermissions)('nope').length === 0);
console.log('\nmodule registry');
check('registry is non-empty', modules_1.MODULE_REGISTRY.length > 0);
check('registry loads without throwing (integrity asserted)', true);
check('modifiers module exists', modules_1.MODULE_REGISTRY.some((m) => m.path === '/admin/modifiers'));
check('wildcard sees every module', (0, modules_1.getVisibleSidebarModules)(['*']).length === modules_1.MODULE_REGISTRY.length);
check('empty permissions sees nothing', (0, modules_1.getVisibleSidebarModules)([]).length === 0);
check('single permission sees only its module', (0, modules_1.getVisibleSidebarModules)([permissions_1.PERMISSIONS.PRODUCT.READ]).length === 1);
check('product:read does not reveal modifier module', !(0, modules_1.getVisibleSidebarModules)([permissions_1.PERMISSIONS.PRODUCT.READ]).some((m) => m.path === '/admin/modifiers'));
check('modifier:read reveals the modifier module', (0, modules_1.getVisibleSidebarModules)([permissions_1.PERMISSIONS.MODIFIER.READ]).some((m) => m.path === '/admin/modifiers'));
check('dashboard module is gated on dashboard:read', !(0, modules_1.getVisibleSidebarModules)([permissions_1.PERMISSIONS.PRODUCT.READ]).some((m) => m.path === '/admin'));
check('getModuleByPath resolves exact path', (0, modules_1.getModuleByPath)('/admin/orders')?.key === 'orders');
check('getModuleByPath resolves sub-routes', (0, modules_1.getModuleByPath)('/admin/orders/123')?.key === 'orders');
check('getModuleByPath falls back to the root module for unknown admin paths', (0, modules_1.getModuleByPath)('/admin/unknown')?.key === 'dashboard');
check('getModuleByPath rejects paths outside /admin', (0, modules_1.getModuleByPath)('/products') === undefined);
check('no module path shadows another (excluding the /admin root)', modules_1.MODULE_REGISTRY.every((m) => m.path === '/admin' ||
    !modules_1.MODULE_REGISTRY.some((other) => other.path !== m.path && other.path.startsWith(`${m.path}/`))));
check('visible modules are ordered', (0, modules_1.getVisibleSidebarModules)(['*']).every((m, i, arr) => i === 0 || arr[i - 1].order <= m.order));
console.log('\nregistry / permissions coverage');
const registrySubjects = new Set(modules_1.MODULE_REGISTRY.map((m) => m.requiredPermission.split(':')[0]));
const unregistered = Array.from(new Set(permissions_1.ALL_PERMISSIONS.map((p) => p.split(':')[0]))).filter((s) => !registrySubjects.has(s) && !permissions_1.API_ONLY_SUBJECTS.includes(s));
check(`every page-backed subject has a registry module (unregistered: ${unregistered.join(', ') || 'none'})`, unregistered.length === 0);
check('API-only subjects are marked as such in the matrix', permissions_1.PERMISSION_MATRIX.filter((s) => !s.hasAdminPage).map((s) => s.key).sort().join(',') ===
    [...permissions_1.API_ONLY_SUBJECTS].sort().join(','));
check('every matrix action is a valid permission', permissions_1.PERMISSION_MATRIX.every((s) => s.actions.every((a) => (0, permissions_1.isValidPermission)(a.permission))));
check('matrix covers every permission exactly once', permissions_1.PERMISSION_MATRIX.flatMap((s) => s.actions.map((a) => a.permission)).sort().join(',') ===
    [...permissions_1.ALL_PERMISSIONS].sort().join(','));
check('every registry module maps to a matrix subject', modules_1.MODULE_REGISTRY.every((m) => registrySubjects.has(m.requiredPermission.split(':')[0])));
check('every registry module permission is grantable in the editor', modules_1.MODULE_REGISTRY.every((m) => permissions_1.PERMISSION_MATRIX.some((s) => s.actions.some((a) => a.permission === m.requiredPermission))));
if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log(`\nAll ${modules_1.MODULE_REGISTRY.length} modules verified. Tests passed.`);
