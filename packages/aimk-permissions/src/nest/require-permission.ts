import { SetMetadata } from '@nestjs/common';
import { Permission } from '../types';

export const REQUIRE_PERMISSION_KEY = 'required_permission';

export const RequirePermission = (permission: Permission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
