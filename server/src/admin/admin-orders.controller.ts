import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  AdminGuard,
} from '../auth/admin.guard.js';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';

import {
  AdminOrdersService,
} from './admin-orders.service.js';

import {
  UpdateAdminOrderStatusDto,
} from './dto/update-admin-orders-status.dto.js';

@Controller('admin/orders')
@UseGuards(
  JwtAuthGuard,
  AdminGuard,
)
export class AdminOrdersController {
  constructor(
    @Inject(AdminOrdersService)
    private readonly ordersService:
      AdminOrdersService,
  ) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,
  ) {
    return this.ordersService.findOne(
      orderId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,

    @Body()
    dto: UpdateAdminOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      orderId,
      dto,
    );
  }
}