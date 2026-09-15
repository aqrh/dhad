import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  UpdateAdminProductDto,
} from './dto/update-admin-product.dto.js';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  CreateAdminProductDto,
} from './dto/create-admin-product.dto.js';

import {
  CreateAdminVariantDto,
} from './dto/create-admin-variant.dto.js';

import {
  UpdateAdminVariantDto,
} from './dto/update-admin-variant.dto.js';

import {
  CreateAdminProductImageDto,
} from './dto/create-admin-product-image.dto.js';

import {
  UpdateAdminProductImageDto,
} from './dto/update-admin-product-image.dto.js';

import {
  R2StorageService,
} from '../storage/r2-storage.service.js';

@Injectable()
export class AdminProductsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma:
      PrismaService,

    @Inject(R2StorageService)
    private readonly storage:
      R2StorageService,
  ) {}

  async findAll() {
    return this.prisma.db.orm.public.Product
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
  }

  async create(
    dto: CreateAdminProductDto,
  ) {
    const slug =
      dto.slug.trim();

    const name =
      dto.name.trim();

    /*
     * Prevent duplicate SKUs inside
     * the same request.
     */
    const variantSkus =
      (dto.variants ?? []).map(
        (variant) =>
          variant.sku.trim(),
      );

    if (
      new Set(variantSkus).size !==
      variantSkus.length
    ) {
      throw new BadRequestException(
        'Variant SKUs must be unique',
      );
    }

    return this.prisma.db.transaction(
      async (tx) => {
        /*
         * Check slug.
         */
        const existingProduct =
          await tx.orm.public.Product.first({
            slug,
          });

        if (existingProduct) {
          throw new BadRequestException(
            `Product slug "${slug}" already exists`,
          );
        }

        /*
         * Check every SKU against
         * existing database variants.
         */
        for (const sku of variantSkus) {
          const existingVariant =
            await tx.orm.public.ProductVariant.first({
              sku,
            });

          if (existingVariant) {
            throw new BadRequestException(
              `SKU "${sku}" already exists`,
            );
          }
        }

        /*
         * Create the main product.
         */
        const product =
          await tx.orm.public.Product.create({
            slug,
            name,

            description:
              dto.description?.trim() ||
              null,

            price:
              dto.price,

            active:
              dto.active ?? true,

            category:
              dto.category ?? 'TSHIRT',

            audience:
              dto.audience ?? 'UNISEX',
            deliveryPrice:
              dto.deliveryPrice ?? null,
          });

        /*
         * Create product images.
         */
        const images =
          dto.images &&
          dto.images.length > 0
            ? await tx.orm.public.ProductImage.createAll(
                dto.images.map(
                  (
                    image,
                    index,
                  ) => ({
                    productId:
                      product.id,

                    url:
                      image.url.trim(),

                    alt:
                      image.alt?.trim() ||
                      null,

                    position:
                      image.position ??
                      index,
                  }),
                ),
              )
            : [];

        /*
         * Create variants.
         */
        const variants =
          dto.variants &&
          dto.variants.length > 0
            ? await tx.orm.public.ProductVariant.createAll(
                dto.variants.map(
                  (variant) => ({
                    productId:
                      product.id,

                    sku:
                      variant.sku.trim(),

                    size:
                      variant.size?.trim() ||
                      null,

                    color:
                      variant.color?.trim() ||
                      null,

                    price:
                      variant.price ??
                      null,

                    stock:
                      variant.stock,
                  }),
                ),
              )
            : [];

        return {
          ...product,
          images,
          variants,
        };
      },
    );
  }


  async update(
  productId: number,
  dto: UpdateAdminProductDto,
) {
  const existing =
    await this.prisma.db.orm.public.Product.first({
      id: productId,
    });

  if (!existing) {
    throw new NotFoundException(
      `Product ${productId} not found`,
    );
  }

  /*
   * Check that a changed slug
   * isn't already used by another product.
   */
  if (dto.slug !== undefined) {
    const slug =
      dto.slug.trim();

    const productWithSlug =
      await this.prisma.db.orm.public.Product.first({
        slug,
      });

    if (
      productWithSlug &&
      productWithSlug.id !== productId
    ) {
      throw new BadRequestException(
        `Product slug "${slug}" already exists`,
      );
    }
  }

  const updated =
    await this.prisma.db.orm.public.Product
      .where({
        id: productId,
      })
      .update({
        ...(dto.slug !== undefined && {
          slug: dto.slug.trim(),
        }),

        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),

        ...(dto.description !== undefined && {
          description:
            dto.description.trim() || null,
        }),

        ...(dto.price !== undefined && {
          price: dto.price,
        }),

        ...(dto.active !== undefined && {
          active: dto.active,
        }),
        ...(dto.category !== undefined && {
          category: dto.category,
        }),
        ...(dto.audience !== undefined && {
          audience: dto.audience,
        }),

        ...(dto.deliveryPrice !== undefined && {
          deliveryPrice: dto.deliveryPrice,
        }),
      });

  if (!updated) {
    throw new NotFoundException(
      `Product ${productId} not found`,
    );
  }

  /*
   * Return the complete product,
   * including its images and variants.
   */
  return this.prisma.db.orm.public.Product
    .include(
      'images',
      (images) =>
        images.orderBy(
          (image) =>
            image.position.asc(),
        ),
    )
    .include('variants')
    .first({
      id: productId,
    });
  }

  async createVariant(
    productId: number,
    dto: CreateAdminVariantDto,
  ) {
    const product =
      await this.prisma.db.orm.public.Product.first({
        id: productId,
      });

    if (!product) {
      throw new NotFoundException(
        `Product ${productId} not found`,
      );
    }

    const sku = dto.sku.trim();

    const existingSku =
      await this.prisma.db.orm.public.ProductVariant.first({
        sku,
      });

    if (existingSku) {
      throw new BadRequestException(
        `SKU "${sku}" already exists`,
      );
    }

    return this.prisma.db.orm.public.ProductVariant.create({
      productId,
      sku,

      size:
        dto.size?.trim() || null,

      color:
        dto.color?.trim() || null,

      price:
        dto.price ?? null,

      stock:
        dto.stock,
    });
  }

  async updateVariant(
    variantId: number,
    dto: UpdateAdminVariantDto,
  ) {
    const existing =
      await this.prisma.db.orm.public.ProductVariant.first({
        id: variantId,
      });

    if (!existing) {
      throw new NotFoundException(
        `Variant ${variantId} not found`,
      );
    }

    if (dto.sku !== undefined) {
      const sku =
        dto.sku.trim();

      const variantWithSku =
        await this.prisma.db.orm.public.ProductVariant.first({
          sku,
        });

      if (
        variantWithSku &&
        variantWithSku.id !== variantId
      ) {
        throw new BadRequestException(
          `SKU "${sku}" already exists`,
        );
      }
    }

    const updated =
      await this.prisma.db.orm.public.ProductVariant
        .where({
          id: variantId,
        })
        .update({
          ...(dto.sku !== undefined && {
            sku:
              dto.sku.trim(),
          }),

          ...(dto.size !== undefined && {
            size:
              dto.size.trim() || null,
          }),

          ...(dto.color !== undefined && {
            color:
              dto.color.trim() || null,
          }),

          ...(dto.price !== undefined && {
            price:
              dto.price,
          }),

          ...(dto.stock !== undefined && {
            stock:
              dto.stock,
          }),
        });

    if (!updated) {
      throw new NotFoundException(
        `Variant ${variantId} not found`,
      );
    }

      return updated;
    }

    async removeVariant(
      variantId: number,
    ) {
      const variant =
        await this.prisma.db.orm.public.ProductVariant
          .include('orderItems')
          .first({
            id: variantId,
          });

      if (!variant) {
        throw new NotFoundException(
          `Variant ${variantId} not found`,
        );
      }

  /*
   * Do not destroy variants that
   * already belong to historical orders.
   */
      if (variant.orderItems.length > 0) {
        throw new BadRequestException(
          'This variant cannot be deleted because it is used by an order',
        );
      }

      const deleted =
        await this.prisma.db.orm.public.ProductVariant
          .where({
           id: variantId,
         })
         .delete();

      if (!deleted) {
       throw new NotFoundException(
         `Variant ${variantId} not found`,
        );
      }

      return {
        success: true,
      };
  }

  async createImage(
    productId: number,
    dto: CreateAdminProductImageDto,
  ) {
    const product =
      await this.prisma.db.orm.public.Product.first({
       id: productId,
      });

    if (!product) {
      throw new NotFoundException(
        `Product ${productId} not found`,
      );
    }

    let position = dto.position;

  /*
   * If position wasn't supplied,
   * place the image after the current
   * last image.
   */
    if (position === undefined) {
      const images =
        await this.prisma.db.orm.public.ProductImage
          .where({
            productId,
          })
          .orderBy(
            (image) =>
              image.position.desc(),
          )
          .limit(1)
          .all();

      position =
       images.length > 0
          ? images[0].position + 1
          : 0;
    }

    return this.prisma.db.orm.public.ProductImage.create({
      productId,

      url: dto.url.trim(),

      alt:
        dto.alt?.trim() || null,

      position,
    });
  }

  async updateImage(
    imageId: number,
    dto: UpdateAdminProductImageDto,
  ) {
    const existing =
      await this.prisma.db.orm.public.ProductImage.first({
        id: imageId,
      });

    if (!existing) {
      throw new NotFoundException(
        `Image ${imageId} not found`,
      );
    }

    const updated =
      await this.prisma.db.orm.public.ProductImage
        .where({
         id: imageId,
        })
        .update({
         ...(dto.url !== undefined && {
            url:
              dto.url.trim(),
          }),

         ...(dto.alt !== undefined && {
            alt:
              dto.alt.trim() || null,
          }),

          ...(dto.position !== undefined && {
            position:
              dto.position,
          }),
        });

    if (!updated) {
      throw new NotFoundException(
        `Image ${imageId} not found`,
      );
    }

    return updated;
  }

  async removeImage(
    imageId: number,
  ) {
    const existing =
      await this.prisma.db.orm.public.ProductImage.first({
        id: imageId,
      });

    if (!existing) {
      throw new NotFoundException(
        `Image ${imageId} not found`,
      );
    }

    const deleted =
      await this.prisma.db.orm.public.ProductImage
        .where({
          id: imageId,
        })
        .delete();

      await this.storage.deleteByPublicUrl(
        existing.url,
      );

      return {
        success: true,
      };
  }

  async findOne(
    productId: number,
  ) {
    const product =
      await this.prisma.db.orm.public.Product
        .include(
          'images',
          (images) =>
            images.orderBy(
              (image) =>
                image.position.asc(),
            ),
        )
        .include('variants')
        .first({
          id: productId,
        });

    if (!product) {
      throw new NotFoundException(
        `Product ${productId} not found`,
      );
    }

    return product;
  }

  async uploadImage(
  productId: number,
  file: Express.Multer.File,
  alt?: string,
) {
  const product =
    await this.prisma.db.orm.public.Product.first({
      id: productId,
    });

  if (!product) {
    throw new NotFoundException(
      `Product ${productId} not found`,
    );
  }

  const images =
    await this.prisma.db.orm.public.ProductImage
      .where({
        productId,
      })
      .orderBy(
        (image) =>
          image.position.desc(),
      )
      .limit(1)
      .all();

  const position =
    images.length > 0
      ? images[0].position + 1
      : 0;

  const uploaded =
    await this.storage.uploadProductImage(
      productId,
      file,
    );

  try {
    return await this.prisma.db.orm.public.ProductImage.create({
      productId,

      url:
        uploaded.url,

      alt:
        alt?.trim() ||
        product.name,

      position,
    });
  } catch (error) {
    /*
     * Don't leave an orphaned R2 object
     * if the database insert fails.
     */
    await this.storage.deleteByPublicUrl(
      uploaded.url,
    );

    throw error;
  }
  }

  async removeProduct(
    productId: number,
  ) {
    const product =
      await this.prisma.db.orm.public.Product
        .include('orderItems')
        .include('images')
        .first({
          id: productId,
        });

    if (!product) {
      throw new NotFoundException(
        `Product ${productId} not found`,
      );
    }

    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        'This product has order history and cannot be permanently deleted. Set it inactive instead.',
      );
    }

    const imageUrls = product.images
      .map((image) => image.url)
      .filter(
        (url): url is string =>
          typeof url === 'string',
      );

    await this.prisma.db.transaction(
      async (tx) => {
        /*
         * A product can have multiple favorites,
         * images, and variants, so use deleteAll().
         */
        await tx.orm.public.Favorite
          .where({
            productId,
          })
          .deleteAll();

        await tx.orm.public.ProductImage
          .where({
            productId,
          })
          .deleteAll();

        await tx.orm.public.ProductVariant
          .where({
            productId,
          })
          .deleteAll();

        /*
         * The product itself is one row.
         */
        const deletedProduct =
          await tx.orm.public.Product
            .where({
              id: productId,
            })
            .delete();

        if (!deletedProduct) {
          throw new NotFoundException(
            `Product ${productId} not found`,
          );
        }
      },
    );

    /*
     * Remove R2 objects only after the
     * database transaction succeeds.
     *
     * deleteByPublicUrl() already ignores
     * non-R2 URLs.
     */
    for (const url of imageUrls) {
      await this.storage.deleteByPublicUrl(
        url,
      );
    }

    return {
      deleted: true,
      id: productId,
    };
  }
}
