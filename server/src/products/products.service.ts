import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
  category?: string,
  audience?: string,
) {
  const allowedCategories = [
    'TSHIRT',
    'HOODIE',
    'SHIRT',
    'JACKET',
    'SUIT',
    'JEANS_BOTTOM',
  ];

  const allowedAudiences = [
    'MEN',
    'WOMEN',
    'UNISEX',
  ];

  if (
    category &&
    !allowedCategories.includes(category)
  ) {
    throw new BadRequestException(
      'Invalid product category',
    );
  }

  if (
    audience &&
    !allowedAudiences.includes(audience)
  ) {
    throw new BadRequestException(
      'Invalid product audience',
    );
  }

  const products =
    await this.prisma.db.orm.public.Product
      .where({
        active: true,

        ...(category && {
          category,
        }),
      })
      .include(
        'images',
        (images) =>
          images.orderBy(
            (image) =>
              image.position.asc(),
          ),
      )
      .include('variants')
      .orderBy(
        (product) =>
          product.createdAt.desc(),
      )
      .all();

  if (!audience) {
    return products;
  }

  return products.filter(
    (product) =>
      product.audience === audience ||
      (
        audience !== 'UNISEX' &&
        product.audience === 'UNISEX'
      ),
  );
  }

  async findOne(id: number) {
    return this.prisma.db.orm.public.Product
      .include('images', (images) =>
        images.orderBy((image) => image.position.asc()),
      )
      .include('variants')
      .first({
        id,
      });
  }
}