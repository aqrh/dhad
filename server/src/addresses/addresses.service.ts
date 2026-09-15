import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  CreateAddressDto,
} from './dto/create-address.dto.js';

import {
  UpdateAddressDto,
} from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma:
      PrismaService,
  ) {}

  async findAll(userId: number) {
    return this.prisma.db.orm.public.Address
      .where({
        userId,
      })
      .orderBy(
        (address) =>
          address.createdAt.desc(),
      )
      .all();
  }

  async create(
    userId: number,
    dto: CreateAddressDto,
  ) {
    return this.prisma.db.orm.public.Address.create({
      label:
        dto.label?.trim() || null,

      fullName:
        dto.fullName.trim(),

      phone:
        dto.phone.trim(),

      governorate:
        dto.governorate.trim(),

      city:
        dto.city.trim(),

      address:
        dto.address.trim(),

      notes:
        dto.notes?.trim() || null,

      userId,
    });
  }

  async remove(
    userId: number,
    addressId: number,
  ) {
    const deleted =
      await this.prisma.db.orm.public.Address
        .where({
          id: addressId,
          userId,
        })
        .delete();

    if (!deleted) {
      throw new NotFoundException(
        `Address ${addressId} not found`,
      );
    }

    return {
      success: true,
    };
  }

  async update(
  userId: number,
  addressId: number,
  dto: UpdateAddressDto,
) {
  const existing =
    await this.prisma.db.orm.public.Address.first({
      id: addressId,
      userId,
    });

  if (!existing) {
    throw new NotFoundException(
      `Address ${addressId} not found`,
    );
  }

  const updated =
    await this.prisma.db.orm.public.Address
      .where({
        id: addressId,
        userId,
      })
      .update({
        ...(dto.label !== undefined && {
          label:
            dto.label.trim() || null,
        }),

        ...(dto.fullName !== undefined && {
          fullName:
            dto.fullName.trim(),
        }),

        ...(dto.phone !== undefined && {
          phone:
            dto.phone.trim(),
        }),

        ...(dto.governorate !==
          undefined && {
          governorate:
            dto.governorate.trim(),
        }),

        ...(dto.city !== undefined && {
          city:
            dto.city.trim(),
        }),

        ...(dto.address !== undefined && {
          address:
            dto.address.trim(),
        }),

        ...(dto.notes !== undefined && {
          notes:
            dto.notes.trim() || null,
        }),
      });

  if (!updated) {
    throw new NotFoundException(
      `Address ${addressId} not found`,
    );
  }

  return updated;
  }
}