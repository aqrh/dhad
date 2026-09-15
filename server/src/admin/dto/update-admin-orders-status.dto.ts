import {
  IsIn,
  IsString,
} from 'class-validator';

export class UpdateAdminOrderStatusDto {
  @IsString()
  @IsIn([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ])
  status!: string;
}