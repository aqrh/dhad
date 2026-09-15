import {
  Type,
} from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateAdminProductImageDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class CreateAdminProductVariantDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsInt()
  @Min(0)
  stock!: number;
}



export class CreateAdminProductDto {
  @IsOptional()
  @IsString()
  @IsIn([
    'MEN',
    'WOMEN',
    'UNISEX',
  ])
  audience?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'TSHIRT',
    'HOODIE',
    'SHIRT',
    'JACKET',
    'SUIT',
    'JEANS_BOTTOM',
  ])
  category?: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  /*
   * Integer cents:
   * 4500 = $45.00
   */
  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryPrice?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      CreateAdminProductImageDto,
  )
  images?: CreateAdminProductImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      CreateAdminProductVariantDto,
  )

  variants?: CreateAdminProductVariantDto[];
}