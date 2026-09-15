import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma:
      PrismaService,
  ) {}

  async findAll(
    userId: number,
  ) {
    return this.prisma.db.orm.public.Favorite
      .where({
        userId,
      })
      .include(
        'product',
        (product) =>
          product.include(
            'images',
            (images) =>
              images
                .orderBy(
                  (image) =>
                    image.position.asc(),
                )
                .limit(1),
          ),
      )
      .orderBy(
        (favorite) =>
          favorite.createdAt.desc(),
      )
      .all();
  }

  async add(
    userId: number,
    productId: number,
  ) {
    /*
     * Make sure the product actually
     * exists and can be purchased.
     */
    const product =
      await this.prisma.db.orm.public.Product.first({
        id: productId,
      });

    if (!product) {
      throw new NotFoundException(
        `Product ${productId} not found`,
      );
    }

    if (!product.active) {
      throw new BadRequestException(
        'Product is unavailable',
      );
    }

    /*
     * Avoid duplicate favorites.
     */
    const existing =
      await this.prisma.db.orm.public.Favorite.first({
        userId,
        productId,
      });

    if (existing) {
      return existing;
    }

    return this.prisma.db.orm.public.Favorite.create({
      userId,
      productId,
    });
  }

  async remove(
    userId: number,
    productId: number,
  ) {
    const deleted =
      await this.prisma.db.orm.public.Favorite
        .where({
          userId,
          productId,
        })
        .delete();

    if (!deleted) {
      throw new NotFoundException(
        'Favorite not found',
      );
    }

    return {
      success: true,
    };
  }
}