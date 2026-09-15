import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
  type JwtPayload,
} from '../auth/jwt-auth.guard.js';

import {
  FavoritesService,
} from './favorites.service.js';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    @Inject(FavoritesService)
    private readonly favoritesService:
      FavoritesService,
  ) {}

  private getUserId(
    request: AuthenticatedRequest,
  ) {
    if (!request.user) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    return request.user.sub;
  }

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.favoritesService.findAll(
      this.getUserId(request),
    );
  }

  @Post(':productId')
  add(
    @Req()
    request: AuthenticatedRequest,

    @Param(
      'productId',
      ParseIntPipe,
    )
    productId: number,
  ) {
    return this.favoritesService.add(
      this.getUserId(request),
      productId,
    );
  }

  @Delete(':productId')
  remove(
    @Req()
    request: AuthenticatedRequest,

    @Param(
      'productId',
      ParseIntPipe,
    )
    productId: number,
  ) {
    return this.favoritesService.remove(
      this.getUserId(request),
      productId,
    );
  }
}