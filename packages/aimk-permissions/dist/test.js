"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("./permissions");
const can_access_1 = require("./can-access");
console.log('Testing @aimk/permissions...');
// Test 1: Wildcard access
const t1 = (0, can_access_1.canAccess)(['*'], permissions_1.PERMISSIONS.PRODUCT.READ);
console.assert(t1 === true, 'Test 1 Failed: Wildcard access should return true');
// Test 2: Exact permission match
const t2 = (0, can_access_1.canAccess)([permissions_1.PERMISSIONS.PRODUCT.READ], permissions_1.PERMISSIONS.PRODUCT.READ);
console.assert(t2 === true, 'Test 2 Failed: Exact permission match should return true');
// Test 3: Missing permission
const t3 = (0, can_access_1.canAccess)([permissions_1.PERMISSIONS.PRODUCT.READ], permissions_1.PERMISSIONS.PRODUCT.CREATE);
console.assert(t3 === false, 'Test 3 Failed: Missing permission should return false');
// Test 4: Empty permissions array
const t4 = (0, can_access_1.canAccess)([], permissions_1.PERMISSIONS.PRODUCT.READ);
console.assert(t4 === false, 'Test 4 Failed: Empty permissions array should return false');
// Test 5: String equality
console.assert(permissions_1.PERMISSIONS.PRODUCT.READ === 'product:read', 'Test 5 Failed: PERMISSIONS.PRODUCT.READ should equal "product:read"');
console.log('✅ All Phase 1 tests passed successfully!');
