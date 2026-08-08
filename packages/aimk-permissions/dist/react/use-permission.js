"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePermission = usePermission;
const can_access_1 = require("../can-access");
function usePermission(userPermissions = []) {
    const isSuperAdmin = Array.isArray(userPermissions) && userPermissions.includes('*');
    const can = (permission) => {
        return (0, can_access_1.canAccess)(userPermissions, permission);
    };
    return {
        can,
        permissions: userPermissions,
        isSuperAdmin,
    };
}
