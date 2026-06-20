import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { USER_TYPES_KEY } from '../decorators/user-types.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedUserTypes =
      this.reflector.getAllAndOverride<('EMPLOYEE' | 'TOURIST')[]>(
        USER_TYPES_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? ['EMPLOYEE']; // Secure by default: default to EMPLOYEE

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const userType = user.userType ?? 'EMPLOYEE';

    if (!allowedUserTypes.includes(userType)) {
      throw new ForbiddenException('Access denied');
    }

    if (userType === 'EMPLOYEE') {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && requiredRoles.length > 0) {
        if (!user.role || !requiredRoles.includes(user.role)) {
          throw new ForbiddenException(
            `Access denied. Required roles: ${requiredRoles.join(', ')}`,
          );
        }
      }
    }

    return true;
  }
}
