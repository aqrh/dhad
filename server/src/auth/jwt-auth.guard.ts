import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

export type JwtPayload = {
  sub: number;
  phone: string;
};

type RequestWithUser = {
  headers: {
    authorization?: string;
  };

  user?: JwtPayload;
};

@Injectable()
export class JwtAuthGuard
  implements CanActivate
{
  constructor(
    @Inject(JwtService)
    private readonly jwtService:
      JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const request =
      context
        .switchToHttp()
        .getRequest<RequestWithUser>();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    const [type, token] =
      authorization.split(' ');

    if (
      type !== 'Bearer' ||
      !token
    ) {
      throw new UnauthorizedException(
        'Invalid authorization header',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
        );

      if (
        typeof payload.sub !==
        'number'
      ) {
        throw new UnauthorizedException(
          'Invalid token',
        );
      }

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token',
      );
    }
  }
}