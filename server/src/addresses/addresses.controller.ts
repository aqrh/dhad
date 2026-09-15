import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  UpdateAddressDto,
} from './dto/update-address.dto.js';

import {
  JwtAuthGuard,
  type JwtPayload,
} from '../auth/jwt-auth.guard.js';

import {
  AddressesService,
} from './addresses.service.js';

import {
  CreateAddressDto,
} from './dto/create-address.dto.js';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    @Inject(AddressesService)
    private readonly addressesService:
      AddressesService,
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
    return this.addressesService.findAll(
      this.getUserId(request),
    );
  }

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    dto: CreateAddressDto,
  ) {
    return this.addressesService.create(
      this.getUserId(request),
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Req()
    request: AuthenticatedRequest,

    @Param('id', ParseIntPipe)
    addressId: number,
  ) {
    return this.addressesService.remove(
      this.getUserId(request),
      addressId,
    );
  }

    @Patch(':id')
    update(
      @Req()
      request: AuthenticatedRequest,

      @Param('id', ParseIntPipe)
      addressId: number,

      @Body()
      dto: UpdateAddressDto,
    ) {
      return this.addressesService.update(
        this.getUserId(request),
        addressId,
        dto,
    );
  }
}