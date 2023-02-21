import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const routeRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    const ctx = context.getArgByIndex(1);
    const userRole = ctx.req.user?.role;

    if (!routeRoles) return true;

    // const userRole =
    //   GqlExecutionContext.create(context).getContext().req.user.role;

    return routeRoles.some((routeRole) => userRole === routeRole);
  }
}
