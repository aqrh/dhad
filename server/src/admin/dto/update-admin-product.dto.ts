import {
  IsBoolean,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateAdminProductDto {
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
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  /*
   * Integer cents.
   * 4500 = $45.00
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryPrice?: number | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

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
}