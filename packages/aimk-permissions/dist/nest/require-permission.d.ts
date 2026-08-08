import { Permission } from '../types';
export declare const REQUIRE_PERMISSION_KEY = "required_permission";
export declare const RequirePermission: (permission: Permission) => import("@nestjs/common").CustomDecorator<string>;
