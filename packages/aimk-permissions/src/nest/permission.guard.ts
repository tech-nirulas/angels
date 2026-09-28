import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { canAccess } from '../can-access';
import { REQUIRE_PERMISSION_KEY } from './require-permission';

@Injectable()
export class PermissionGuard implements CanActivate {
  private reflector: Reflector;

  constructor(reflector?: Reflector) {
    this.reflector = reflector || new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        message: 'User not authenticated',
        code: 'UNAUTHENTICATED',
      });
    }

    const permissions: string[] = user.permissions || [];

    const hasAccess = canAccess(permissions as any, requiredPermission as any);

    if (!hasAccess) {
      throw new ForbiddenException({
        message: `Insufficient permissions. Required: ${requiredPermission}`,
        code: 'FORBIDDEN',
      });
    }

    return true;
  }
}
