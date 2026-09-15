import 'dotenv/config';

import {
  Module,
} from '@nestjs/common';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  AuthController,
} from './auth.controller.js';

import {
  AuthService,
} from './auth.service.js';

import {
  JwtAuthGuard,
} from './jwt-auth.guard.js';

import {
  OptionalJwtAuthGuard,
} from './optional-jwt-auth.guard.js';

import {
  AdminGuard,
} from './admin.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET,

      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    AdminGuard,
  ],

  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    AdminGuard,
  ],
})
export class AuthModule {}