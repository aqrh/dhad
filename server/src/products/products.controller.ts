import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  findAll(
    @Query('category')
    category?: string,

    @Query('audience')
    audience?: string,
  ) {
    return this.productsService.findAll(
      category,
      audience,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const product =
      await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException(
        `Product ${id} not found`,
      );
    }

    return product;
  }
}