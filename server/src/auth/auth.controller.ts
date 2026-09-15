import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  UpdateProfileDto,
} from './dto/update-profile.dto.js';

import {
  JwtAuthGuard,
  type JwtPayload,
} from './jwt-auth.guard.js';

import {
  AuthService,
} from './auth.service.js';

import {
  RequestOtpDto,
} from './dto/request-otp.dto.js';

import {
  VerifyOtpDto,
} from './dto/verify-otp.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService:
      AuthService,
  ) {}

@Patch('me')
@UseGuards(JwtAuthGuard)
updateMe(
  @Req()
  request: {
    user?: JwtPayload;
  },

  @Body()
  dto: UpdateProfileDto,
) {
  if (!request.user) {
    throw new UnauthorizedException(
      'Authentication required',
    );
  }

  return this.authService.updateProfile(
    request.user.sub,
    dto,
  );
}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  requestOtp(
    @Body()
    dto: RequestOtpDto,
  ) {
    return this.authService.requestOtp(
      dto,
    );
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(
    @Body()
    dto: VerifyOtpDto,
  ) {
    return this.authService.verifyOtp(
      dto,
    );
  }

  @Get('me')
@UseGuards(JwtAuthGuard)
getMe(
  @Req()
  request: {
    user?: JwtPayload;
  },
) {
  if (!request.user) {
    throw new UnauthorizedException(
      'Authentication required',
    );
  }

  return this.authService.getCurrentUser(
    request.user.sub,
  );
}
}