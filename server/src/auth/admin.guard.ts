import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import type {
  JwtPayload,
} from './jwt-auth.guard.js';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@Injectable()
export class AdminGuard
  implements CanActivate
{
  constructor(
    @Inject(PrismaService)
    private readonly prisma:
      PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    const user =
      await this.prisma.db.orm.public.User.first({
        id: request.user.sub,
      });

    if (!user) {
      throw new UnauthorizedException(
        'User no longer exists',
      );
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Admin access required',
      );
    }

    return true;
  }
}