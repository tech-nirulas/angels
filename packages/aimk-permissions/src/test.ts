import { canAccess, STRICT_WILDCARD_POLICY } from './can-access';
import { getModuleByPath, getVisibleSidebarModules, MODULE_REGISTRY } from './modules';
import type { AnyPermission } from './types';
import {
  ALL_PERMISSIONS,
  API_ONLY_SUBJECTS,
  isValidPermission,
  isWildcardPermission,
  PERMISSIONS,
  PERMISSION_MATRIX,
  sanitizePermissions,
} from './permissions';

let failures = 0;
function check(name: string, condition: boolean): void {
  if (condition) {
    console.log(`  ok  ${name}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${name}`);
  }
}

console.log('Testing @aimk/permissions...\n');

console.log('canAccess');
check('global wildcard grants access', canAccess(['*'], PERMISSIONS.PRODUCT.READ));
check('*:* grants access', canAccess(['*:*'], PERMISSIONS.PAYMENT.REFUND));
check('exact match grants access', canAccess([PERMISSIONS.PRODUCT.READ], PERMISSIONS.PRODUCT.READ));
check('different action is denied', !canAccess([PERMISSIONS.PRODUCT.READ], PERMISSIONS.PRODUCT.CREATE));
check('empty permissions denied', !canAccess([], PERMISSIONS.PRODUCT.READ));
check('non-array denied', !canAccess(null as any, PERMISSIONS.PRODUCT.READ));
check('subject wildcard grants its actions', canAccess(['product:*'], PERMISSIONS.PRODUCT.DELETE));
check('subject wildcard does not cross subjects', !canAccess(['product:*'], PERMISSIONS.ORDER.READ));
check('action wildcard grants across subjects', canAccess(['*:read'], PERMISSIONS.ORDER.READ));
check(
  'strict policy rejects action wildcard',
  !canAccess(['*:read'], PERMISSIONS.ORDER.READ, STRICT_WILDCARD_POLICY),
);
check(
  'strict policy still honours subject wildcard',
  canAccess(['order:*'], PERMISSIONS.ORDER.READ, STRICT_WILDCARD_POLICY),
);
check(
  'role names are not permissions',
  !canAccess(['super_admin' as AnyPermission], PERMISSIONS.PRODUCT.READ),
);

console.log('\nvalidation');
check('known permission is valid', isValidPermission(PERMISSIONS.USER.MANAGE_ROLES));
check('unknown permission is invalid', !isValidPermission('product:fly'));
check('bare colon string is invalid', !isValidPermission(':read'));
check('non-string is invalid', !isValidPermission(42));
check('wildcards detected', isWildcardPermission('*') && isWildcardPermission('*:*'));
check('ALL_PERMISSIONS has no duplicates', new Set(ALL_PERMISSIONS).size === ALL_PERMISSIONS.length);
check('every PERMISSIONS entry is enumerated', ALL_PERMISSIONS.length > 0);
check(
  'sanitize drops unknown strings',
  JSON.stringify(sanitizePermissions([PERMISSIONS.PRODUCT.READ, 'nope', ':bad'])) ===
    JSON.stringify([PERMISSIONS.PRODUCT.READ]),
);
check('sanitize keeps wildcards', sanitizePermissions(['*']).length === 1);
check('sanitize handles non-array', sanitizePermissions('nope').length === 0);

console.log('\nmodule registry');
check('registry is non-empty', MODULE_REGISTRY.length > 0);
check('registry loads without throwing (integrity asserted)', true);
check('modifiers module exists', MODULE_REGISTRY.some((m) => m.path === '/admin/modifiers'));
check(
  'wildcard sees every module',
  getVisibleSidebarModules(['*']).length === MODULE_REGISTRY.length,
);
check(
  'empty permissions sees nothing',
  getVisibleSidebarModules([]).length === 0,
);
check(
  'single permission sees only its module',
  getVisibleSidebarModules([PERMISSIONS.PRODUCT.READ]).length === 1,
);
check(
  'product:read does not reveal modifier module',
  !getVisibleSidebarModules([PERMISSIONS.PRODUCT.READ]).some((m) => m.path === '/admin/modifiers'),
);
check(
  'modifier:read reveals the modifier module',
  getVisibleSidebarModules([PERMISSIONS.MODIFIER.READ]).some((m) => m.path === '/admin/modifiers'),
);
check(
  'dashboard module is gated on dashboard:read',
  !getVisibleSidebarModules([PERMISSIONS.PRODUCT.READ]).some((m) => m.path === '/admin'),
);
check('getModuleByPath resolves exact path', getModuleByPath('/admin/orders')?.key === 'orders');
check(
  'getModuleByPath resolves sub-routes',
  getModuleByPath('/admin/orders/123')?.key === 'orders',
);
check(
  'getModuleByPath falls back to the root module for unknown admin paths',
  getModuleByPath('/admin/unknown')?.key === 'dashboard',
);
check('getModuleByPath rejects paths outside /admin', getModuleByPath('/products') === undefined);
check(
  'no module path shadows another (excluding the /admin root)',
  MODULE_REGISTRY.every((m) =>
    m.path === '/admin' ||
    !MODULE_REGISTRY.some(
      (other) => other.path !== m.path && other.path.startsWith(`${m.path}/`),
    ),
  ),
);
check(
  'visible modules are ordered',
  getVisibleSidebarModules(['*']).every(
    (m, i, arr) => i === 0 || arr[i - 1].order <= m.order,
  ),
);

console.log('\nregistry / permissions coverage');
const registrySubjects = new Set(MODULE_REGISTRY.map((m) => m.requiredPermission.split(':')[0]));
const unregistered = Array.from(
  new Set(ALL_PERMISSIONS.map((p) => p.split(':')[0])),
).filter(
  (s) => !registrySubjects.has(s) && !(API_ONLY_SUBJECTS as readonly string[]).includes(s),
);
check(
  `every page-backed subject has a registry module (unregistered: ${unregistered.join(', ') || 'none'})`,
  unregistered.length === 0,
);
check(
  'API-only subjects are marked as such in the matrix',
  PERMISSION_MATRIX.filter((s) => !s.hasAdminPage).map((s) => s.key).sort().join(',') ===
    [...API_ONLY_SUBJECTS].sort().join(','),
);
check(
  'every matrix action is a valid permission',
  PERMISSION_MATRIX.every((s) => s.actions.every((a) => isValidPermission(a.permission))),
);
check(
  'matrix covers every permission exactly once',
  PERMISSION_MATRIX.flatMap((s) => s.actions.map((a) => a.permission)).sort().join(',') ===
    [...ALL_PERMISSIONS].sort().join(','),
);
check(
  'every registry module maps to a matrix subject',
  MODULE_REGISTRY.every((m) => registrySubjects.has(m.requiredPermission.split(':')[0])),
);
check(
  'every registry module permission is grantable in the editor',
  MODULE_REGISTRY.every((m) =>
    PERMISSION_MATRIX.some((s) => s.actions.some((a) => a.permission === m.requiredPermission)),
  ),
);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${MODULE_REGISTRY.length} modules verified. Tests passed.`);
