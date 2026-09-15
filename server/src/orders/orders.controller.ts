import {
  Body,
  Controller,
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
  OptionalJwtAuthGuard,
} from '../auth/optional-jwt-auth.guard.js';

import {
  CreateOrderDto,
} from './dto/create-order.dto.js';

import {
  OrdersService,
} from './orders.service.js';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(OrdersService)
    private readonly ordersService:
      OrdersService,
  ) {}

  /*
   * Signed-in user's orders only.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    if (!request.user) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    return this.ordersService.findAllForUser(
      request.user.sub,
    );
  }

@Get(':id')
@UseGuards(JwtAuthGuard)
findOne(
  @Req()
  request: AuthenticatedRequest,

  @Param('id', ParseIntPipe)
  orderId: number,
) {
  if (!request.user) {
    throw new UnauthorizedException(
      'Authentication required',
    );
  }

  return this.ordersService.findOneForUser(
    request.user.sub,
    orderId,
  );
}

  /*
   * Checkout:
   * works for signed-in users
   * and guests.
   */
  @Post()
  @UseGuards(
    OptionalJwtAuthGuard,
  )
  create(
    @Body()
    dto: CreateOrderDto,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.ordersService.create(
      dto,
      request.user?.sub,
    );
  }
}