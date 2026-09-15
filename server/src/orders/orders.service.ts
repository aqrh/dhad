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
  CreateOrderDto,
} from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async findAllForUser(
  userId: number,
) {
  return this.prisma.db.orm.public.Order
    .where({
      userId,
    })
    .include(
      'items',
      (items) =>
        items.include(
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
        ),
    )
    .orderBy(
      (order) =>
        order.createdAt.desc(),
    )
    .all();
}

async findOneForUser(
  userId: number,
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
        userId,
      });

  if (!order) {
    throw new NotFoundException(
      `Order ${orderId} not found`,
    );
  }

  return order;
}

private getDefaultDeliveryPrice(
  governorate: string,
) {
  const normalized =
    governorate.trim().toLowerCase();

  if (
    normalized === "baghdad" ||
    normalized === "بغداد" ||
    normalized === "basra" ||
    normalized === "بصرة" ||
    normalized === "بصره"
  ) {
    return 5000;
  }

  return 7000;
}

  async create(
  dto: CreateOrderDto,
  userId?: number,
) {
    return this.prisma.db.transaction(
      async (tx) => {
        const resolvedItems: Array<{
          variantId: number;
          productId: number;
          sku: string;
          quantity: number;
          price: number;
          currentStock: number;
          deliveryPrice: number | null;
        }> = [];

        /*
         * 1. Reload every variant from PostgreSQL.
         */
        for (const item of dto.items) {
          const variant =
            await tx.orm.public.ProductVariant
              .include('product')
              .first({
                id: item.variantId,
              });

          if (!variant) {
            throw new NotFoundException(
              `Variant ${item.variantId} not found`,
            );
          }

          if (!variant.product.active) {
            throw new BadRequestException(
              `Product ${variant.productId} is unavailable`,
            );
          }

          if (variant.stock < item.quantity) {
            throw new BadRequestException(
              `Not enough stock for ${variant.sku}`,
            );
          }

          /*
           * Variant price overrides product price.
           */
          const rawPrice =
            variant.price ??
            variant.product.price;

        if (typeof rawPrice !== 'number') {
            throw new BadRequestException(
                `Invalid price for variant ${variant.id}`,
            );
        }

        const price = rawPrice;
        const rawDeliveryPrice = variant.product.deliveryPrice;
        const productDeliveryPrice = typeof rawDeliveryPrice === "number"
          ? rawDeliveryPrice : null;

        resolvedItems.push({
            variantId: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            quantity: item.quantity,
            price,
            deliveryPrice: productDeliveryPrice,
            currentStock: variant.stock,
        });
        }

        /*
         * 2. Calculate prices entirely on backend.
         */
        const subtotal =
          resolvedItems.reduce(
            (sum, item) =>
              sum +
              item.price *
                item.quantity,
            0,
          );

        // Temporary until delivery pricing is implemented.
        const defaultDelivery = this.getDefaultDeliveryPrice(dto.governorate,);
        const delivery = resolvedItems.length === 0
          ? defaultDelivery : Math.max(
            ...resolvedItems.map((item) => item.deliveryPrice ?? defaultDelivery)
          )

        const total =
          subtotal + delivery;

        /*
         * 3. Create order.
         */
        const order =
          await tx.orm.public.Order.create({
            status: 'PENDING',

            subtotal,
            delivery,
            total,

            fullName: dto.fullName,
            phone: dto.phone,
            governorate:
              dto.governorate,
            city: dto.city,
            address: dto.address,
            notes:
              dto.notes ?? null,

            userId:
              userId ?? null,
  });

        /*
         * 4. Create order items.
         */
        await tx.orm.public.OrderItem.createAll(
          resolvedItems.map(
            (item) => ({
              orderId: order.id,

              productId:
                item.productId,

              variantId:
                item.variantId,

              quantity:
                item.quantity,

              price:
                item.price,
            }),
          ),
        );

        /*
         * 5. Reduce stock.
         */
        for (const item of resolvedItems) {
          const updatedVariant =
            await tx.orm.public.ProductVariant
              .where({
                id: item.variantId,
                stock: item.currentStock,
              })
              .update({
                  stock:
                  item.currentStock -
                  item.quantity,
              });
          if(!updatedVariant) {
            throw new BadRequestException(
              `Stock changed for ${item.sku}. Please refresh your cart and try again.`,
            );
          }
        }

        return {
          id: order.id,
          status: order.status,
          subtotal: order.subtotal,
          delivery:
            order.delivery,
          total: order.total,
        };
      },
    );
  }
}