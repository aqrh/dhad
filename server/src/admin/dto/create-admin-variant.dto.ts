import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAdminVariantDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  /*
   * Integer cents.
   * Omit to use Product.price.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsInt()
  @Min(0)
  stock!: number;
}