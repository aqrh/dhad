import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{11,15}$/, {
    message:
      'phone must contain 11 to 15 digits',
  })
  phone!: string;
}