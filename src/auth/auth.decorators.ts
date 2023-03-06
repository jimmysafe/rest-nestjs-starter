import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../user/user.entity';
import { RolesGuard } from './roles.guard';

/**
 * Apply a set of roles to a resolver
 * @param roles List of roles to use
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

/**
 * Protect a query or resolver by applying this decorator
 * @param roles A list of user roles that have access to the resource.
 */
export const Auth = (...roles: UserRole[]) => {
  if (roles.length === 0) return applyDecorators();
  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard('jwt'), RolesGuard),
  );
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
