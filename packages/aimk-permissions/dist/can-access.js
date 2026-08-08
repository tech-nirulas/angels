"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccess = canAccess;
function canAccess(userPermissions, permission) {
    if (!Array.isArray(userPermissions)) {
        return false;
    }
    const perms = userPermissions;
    if (perms.includes('*') ||
        perms.includes('*:*') ||
        perms.includes('super_admin')) {
        return true;
    }
    if (perms.includes(permission)) {
        return true;
    }
    if (permission && permission.includes(':')) {
        const [subject, action] = permission.split(':');
        if (perms.includes(`${subject}:*`) ||
            perms.includes(`*:${action}`)) {
            return true;
        }
    }
    return false;
}
