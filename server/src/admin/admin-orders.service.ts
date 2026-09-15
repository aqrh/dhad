import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  UpdateAdminOrderStatusDto,
} from './dto/update-admin-orders-status.dto.js';

@Injectable()
export class AdminOrdersService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma:
      PrismaService,
  ) {}

  async findAll() {
    return this.prisma.db.orm.public.Order
      .include(
        'items',
        (items) =>
          items
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
            .include('variant'),
      )
      .orderBy(
        (order) =>
          order.createdAt.desc(),
      )
      .all();
  }

  async findOne(
    orderId: number,
  ) {
  const order =
    await this.prisma.db.orm.public.Order
      .include(
        'items',
        (items) =>
          items
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
              .include('variant'),
        )
        .first({
          id: orderId,
        });

    if (!order) {
      throw new NotFoundException(
        `Order ${orderId} not found`,
      );
    }

    return order;
  }

  async updateStatus(
  orderId: number,
  dto: UpdateAdminOrderStatusDto,
  ) {
  return this.prisma.db.transaction(
    async (tx) => {
      const order =
        await tx.orm.public.Order
          .include('items')
          .first({
            id: orderId,
          });

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found`,
        );
      }

      const nextStatus =
        dto.status;

      /*
       * Don't do anything if the
       * status is already selected.
       */
      if (
        order.status ===
        nextStatus
      ) {
        return this.findOne(
          orderId,
        );
      }

      const allowedTransitions: Record<
        string,
        string[]
      > = {
        PENDING: [
          'PROCESSING',
          'CANCELLED',
        ],

        PROCESSING: [
          'SHIPPED',
          'CANCELLED',
        ],

        SHIPPED: [
          'DELIVERED',
        ],

        DELIVERED: [],

        CANCELLED: [],
      };

      const allowed =
        allowedTransitions[
          order.status
        ] ?? [];

      if (
        !allowed.includes(
          nextStatus,
        )
      ) {
        throw new BadRequestException(
          `Cannot change order from ${order.status} to ${nextStatus}`,
        );
      }

      /*
       * Restore inventory when an
       * order is cancelled.
       */
      if (nextStatus === 'CANCELLED') {
        for (const item of order.items) {
          const rawVariantId =
            item.variantId;

          const rawQuantity =
          item.quantity;

          if (
            typeof rawVariantId !==
            'number' ||
            !Number.isInteger(
              rawVariantId,
            )
          ) {
            throw new BadRequestException(
              'Order item has an invalid variant ID',
            );
          }

          if (
            typeof rawQuantity !==
              'number' ||
            !Number.isInteger(
              rawQuantity,
            ) ||
            rawQuantity < 1
          ) {
            throw new BadRequestException(
              'Order item has an invalid quantity',
            );
            }

          const variant =
            await tx.orm.public.ProductVariant.first({
              id: rawVariantId,
           });

          if (!variant) {
            throw new BadRequestException(
              `Variant ${rawVariantId} no longer exists`,
            );
          }

          const rawStock =
            variant.stock;

          if (
            typeof rawStock !==
          'number'
          ) {
            throw new BadRequestException(
              `Variant ${rawVariantId} has invalid stock`,
            );
          }

          await tx.orm.public.ProductVariant
            .where({
              id: rawVariantId,
            })
            .update({
              stock:
                rawStock +
                rawQuantity,
            });
        }
      }

      await tx.orm.public.Order
        .where({
          id: orderId,
        })
        .update({
          status:
            nextStatus,
        });

      /*
       * Return inside transaction
       * instead of calling this.findOne(),
       * which uses the outer Prisma client.
       */
      const updated =
        await tx.orm.public.Order
          .include(
            'items',
            (items) =>
              items
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
                          .limit(
                            1,
                          ),
                    ),
                )
                .include(
                  'variant',
                ),
          )
          .first({
            id: orderId,
          });

      if (!updated) {
        throw new NotFoundException(
          `Order ${orderId} not found`,
        );
      }

      return updated;
    },
  );
  }
}