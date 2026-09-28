"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRICT_WILDCARD_POLICY = exports.DEFAULT_WILDCARD_POLICY = void 0;
exports.canAccess = canAccess;
const permissions_1 = require("./permissions");
exports.DEFAULT_WILDCARD_POLICY = {
    global: true,
    subject: true,
    action: true,
};
/**
 * Action-scoped wildcards are opt-in. `*:read` silently reveals every read module across the
 * whole app, so a role that only meant to widen one subject should not receive it by accident.
 */
exports.STRICT_WILDCARD_POLICY = {
    global: true,
    subject: true,
    action: false,
};
function canAccess(userPermissions, permission, policy = exports.DEFAULT_WILDCARD_POLICY) {
    if (!Array.isArray(userPermissions) || !permission) {
        return false;
    }
    const perms = userPermissions;
    if (policy.global && perms.some(permissions_1.isWildcardPermission)) {
        return true;
    }
    if (perms.includes(permission)) {
        return true;
    }
    if (permission.includes(':')) {
        const [subject, action] = permission.split(':');
        if (policy.subject && perms.includes(`${subject}:*`)) {
            return true;
        }
        if (policy.action && perms.includes(`*:${action}`)) {
            return true;
        }
    }
    return false;
}
