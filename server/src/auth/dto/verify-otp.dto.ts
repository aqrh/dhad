import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{11,15}$/, {
    message:
      'phone must contain 11 to 15 digits',
  })
  phone!: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message:
      'code must contain exactly 6 digits',
  })
  code!: string;
}