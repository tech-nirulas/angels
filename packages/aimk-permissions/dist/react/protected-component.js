"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedComponent = ProtectedComponent;
const jsx_runtime_1 = require("react/jsx-runtime");
const can_access_1 = require("../can-access");
function ProtectedComponent({ permission, userPermissions = [], fallback = null, children, }) {
    const hasAccess = (0, can_access_1.canAccess)(userPermissions, permission);
    if (!hasAccess) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: fallback });
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
}
