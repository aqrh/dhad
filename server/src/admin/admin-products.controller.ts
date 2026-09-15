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
  UseGuards,
} from '@nestjs/common';

import {
  CreateAdminVariantDto,
} from './dto/create-admin-variant.dto.js';

import {
  UpdateAdminVariantDto,
} from './dto/update-admin-variant.dto.js';

import {
  UpdateAdminProductDto,
} from './dto/update-admin-product.dto.js';

import {
  AdminGuard,
} from '../auth/admin.guard.js';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard.js';

import {
  CreateAdminProductDto,
} from './dto/create-admin-product.dto.js';

import {
  AdminProductsService,
} from './admin-products.service.js';

import {
  CreateAdminProductImageDto,
} from './dto/create-admin-product-image.dto.js';

import {
  UpdateAdminProductImageDto,
} from './dto/update-admin-product-image.dto.js';

import {
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';

@Controller('admin/products')
@UseGuards(
  JwtAuthGuard,
  AdminGuard,
)
export class AdminProductsController {
  constructor(
    @Inject(AdminProductsService)
    private readonly productsService:
      AdminProductsService,
  ) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  create(
    @Body()
    dto: CreateAdminProductDto,
  ) {
    return this.productsService.create(
      dto,
    );
  }

  @Post(':id/variants')
  createVariant(
    @Param(
      'id',
      ParseIntPipe,
    )
    productId: number,

    @Body()
    dto: CreateAdminVariantDto,
  ) {
    return this.productsService.createVariant(
      productId,
      dto,
    );
  }

  @Patch('/variants/:variantId')
  updateVariant(
    @Param(
      'variantId',
      ParseIntPipe,
    )
    variantId: number,

    @Body()
    dto: UpdateAdminVariantDto,
  ) {
    return this.productsService.updateVariant(
      variantId,
      dto,
    );
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    productId: number,

    @Body()
    dto: UpdateAdminProductDto,
  ) {
    return this.productsService.update(
      productId,
      dto,
    );
  }

  @Delete('/variants/:variantId')
  removeVariant(
    @Param(
      'variantId',
      ParseIntPipe,
    )
    variantId: number,
  ) {
    return this.productsService.removeVariant(
      variantId,
    );
  }

  @Post(':id/images')
  createImage(
    @Param(
      'id',
      ParseIntPipe,
    )
    productId: number,

    @Body()
    dto: CreateAdminProductImageDto,
  ) {
    return this.productsService.createImage(
      productId,
      dto,
    );
  }

  @Patch('images/:imageId')
  updateImage(
    @Param(
      'imageId',
      ParseIntPipe,
    )
    imageId: number,

    @Body()
    dto: UpdateAdminProductImageDto,
  ) {
    return this.productsService.updateImage(
      imageId,
      dto,
    );
  }

  @Delete('images/:imageId')
  removeImage(
    @Param(
      'imageId',
      ParseIntPipe,
    )
    imageId: number,
  ) {
    return this.productsService.removeImage(
      imageId,
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    productId: number,
  ) {
    return this.productsService.findOne(
      productId,
    );
  }

  @Post(':id/images/upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          memoryStorage(),

        limits: {
          fileSize:
            8 * 1024 * 1024,
        },
      },
    ),
  )
  uploadImage(
    @Param(
      'id',
      ParseIntPipe,
    )
    productId: number,

    @UploadedFile()
   file: Express.Multer.File,

    @Body('alt')
    alt?: string,
    ) {
    return this.productsService.uploadImage(
      productId,
      file,
     alt,
    );
  }

  @Delete(":id")
  removeProduct(
    @Param("id", ParseIntPipe)
    productId: number,
  ) {
    return this.productsService.removeProduct(
      productId,
    );
  }
}