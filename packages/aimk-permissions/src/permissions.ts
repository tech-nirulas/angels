import type { Permission } from './types';

export const PERMISSIONS = {
  DASHBOARD:        { READ: 'dashboard:read' },
  PRODUCT:          { READ: 'product:read', CREATE: 'product:create', UPDATE: 'product:update', DELETE: 'product:delete' },
  CATEGORY:         { READ: 'category:read', CREATE: 'category:create', UPDATE: 'category:update', DELETE: 'category:delete' },
  BRAND:            { READ: 'brand:read', CREATE: 'brand:create', UPDATE: 'brand:update', DELETE: 'brand:delete' },
  INVENTORY:        { READ: 'inventory:read', CREATE: 'inventory:create', UPDATE: 'inventory:update', DELETE: 'inventory:delete' },
  ORDER:            { READ: 'order:read', UPDATE_STATUS: 'order:update-status', ASSIGN_OUTLET: 'order:assign-outlet' },
  PAYMENT:          { READ: 'payment:read', REFUND: 'payment:refund' },
  DISCOUNT:         { READ: 'discount:read', CREATE: 'discount:create', UPDATE: 'discount:update', DELETE: 'discount:delete' },
  OFFER:            { READ: 'offer:read', CREATE: 'offer:create', UPDATE: 'offer:update', DELETE: 'offer:delete' },
  REVIEW:           { READ: 'review:read', MODERATE: 'review:moderate', DELETE: 'review:delete' },
  CAKE:             { READ: 'cake:read', UPDATE: 'cake:update' },
  OUTLET:           { READ: 'outlet:read', CREATE: 'outlet:create', UPDATE: 'outlet:update', DELETE: 'outlet:delete' },
  OUTLET_PRICE:     { READ: 'outlet-price:read', CREATE: 'outlet-price:create', UPDATE: 'outlet-price:update', DELETE: 'outlet-price:delete' },
  MEDIA:            { READ: 'media:read', CREATE: 'media:create', UPDATE: 'media:update', DELETE: 'media:delete' },
  LEGAL_ENTITY:     { READ: 'legal-entity:read', CREATE: 'legal-entity:create', UPDATE: 'legal-entity:update', DELETE: 'legal-entity:delete' },
  USER:             { READ: 'user:read', CREATE: 'user:create', UPDATE: 'user:update', DELETE: 'user:delete', MANAGE_ROLES: 'user:manage-roles' },
  CUSTOMER:         { READ: 'customer:read', UPDATE: 'customer:update', UPDATE_LOYALTY: 'customer:update-loyalty' },
  DELIVERY_ZONE:    { READ: 'delivery-zone:read', CREATE: 'delivery-zone:create', UPDATE: 'delivery-zone:update', DELETE: 'delivery-zone:delete' },
  SERVICEABLE_AREA: { READ: 'serviceable-area:read', CREATE: 'serviceable-area:create', UPDATE: 'serviceable-area:update', DELETE: 'serviceable-area:delete' },
  MODIFIER:         { READ: 'modifier:read', CREATE: 'modifier:create', UPDATE: 'modifier:update', DELETE: 'modifier:delete' },
} as const;

/**
 * Subjects that gate API behaviour but have no dedicated admin page, so they intentionally have
 * no MODULE_REGISTRY entry. They are still grantable in the permission editor and enforced by the
 * backend guard. Keep this list in sync if an admin page is ever added for them.
 */
export const API_ONLY_SUBJECTS = ['delivery-zone', 'serviceable-area'] as const;

function titleCase(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

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

const PERMISSION_LABELS: Record<string, string> = {
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

export const PERMISSION_MATRIX: PermissionSubjectDefinition[] = (
  Object.keys(PERMISSIONS) as Array<keyof typeof PERMISSIONS>
).map((subjectKey) => {
  const subject = PERMISSIONS[subjectKey];
  const key = subjectKey.toLowerCase().replace(/_/g, '-');
  return {
    key,
    label: PERMISSION_LABELS[key] ?? titleCase(key),
    hasAdminPage: !(API_ONLY_SUBJECTS as readonly string[]).includes(key),
    actions: (Object.keys(subject) as Array<keyof typeof subject>).map((actionKey) => ({
      key: String(actionKey).toLowerCase(),
      label: PERMISSION_LABELS[String(actionKey).toLowerCase()] ?? titleCase(String(actionKey)),
      permission: subject[actionKey] as Permission,
    })),
  };
});

export const WILDCARD_PERMISSION = '*';
export const ALL_WILDCARDS = ['*', '*:*'] as const;

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS).flatMap(
  (subject) => Object.values(subject),
) as unknown as readonly Permission[];

const PERMISSION_SET: ReadonlySet<string> = new Set<string>(ALL_PERMISSIONS);

export function isValidPermission(value: unknown): value is Permission {
  return typeof value === 'string' && PERMISSION_SET.has(value);
}

export function isWildcardPermission(value: unknown): boolean {
  return typeof value === 'string' && ALL_WILDCARDS.includes(value as (typeof ALL_WILDCARDS)[number]);
}

/**
 * Validates a client-supplied permission list, dropping wildcards and unknown strings.
 * Call this at every write boundary so a typo fails closed instead of granting nothing.
 */
export function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  for (const entry of input) {
    if (isValidPermission(entry) || isWildcardPermission(entry)) seen.add(entry);
  }
  return Array.from(seen);
}
