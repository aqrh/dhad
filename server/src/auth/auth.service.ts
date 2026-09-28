import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  UpdateProfileDto,
} from './dto/update-profile.dto.js';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';

import {
  Temporal,
} from 'temporal-polyfill/full';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  RequestOtpDto,
} from './dto/request-otp.dto.js';

import {
  VerifyOtpDto,
} from './dto/verify-otp.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma:
      PrismaService,

    @Inject(JwtService)
    private readonly jwtService:
      JwtService,
  ) {}

  private getOtpSecret() {
    const secret =
      process.env.OTP_SECRET;

    if (!secret) {
      throw new Error(
        'OTP_SECRET is not configured',
      );
    }

    return secret;
  }

  private hashOtp(
    phone: string,
    code: string,
  ) {
    return createHmac(
      'sha256',
      this.getOtpSecret(),
    )
      .update(
        `${phone}:${code}`,
      )
      .digest('hex');
  }

  private compareHashes(
    first: string,
    second: string,
  ) {
    const firstBuffer =
      Buffer.from(
        first,
        'hex',
      );

    const secondBuffer =
      Buffer.from(
        second,
        'hex',
      );

    if (
      firstBuffer.length !==
      secondBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      firstBuffer,
      secondBuffer,
    );
  }

  async updateProfile(
  userId: number,
  dto: UpdateProfileDto,
) {
  const user =
    await this.prisma.db.orm.public.User.first({
      id: userId,
    });

  if (!user) {
    throw new UnauthorizedException(
      'User no longer exists',
    );
  }

  const updated =
    await this.prisma.db.orm.public.User
      .where({
        id: userId,
      })
      .update({
        ...(dto.name !== undefined && {
          name:
            dto.name.trim() || null,
        }),

        ...(dto.email !== undefined && {
          email:
            dto.email.trim() || null,
        }),
      });

  if (!updated) {
    throw new BadRequestException(
      'Could not update profile',
    );
  }

  return {
    id: updated.id,
    phone: updated.phone,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  };
}

  async requestOtp(
    dto: RequestOtpDto,
  ) {
    const phone =
      dto.phone.trim();

    const code = randomInt(
      100000,
      1000000,
    ).toString();

    const codeHash =
      this.hashOtp(
        phone,
        code,
      );

    const expiresAt =
      Temporal.Now.instant().add({
        minutes: 5,
      });

    const existing =
      await this.prisma.db.orm.public.OtpCode.first({
        phone,
      });

    if (existing) {
      await this.prisma.db.orm.public.OtpCode
        .where({
          id: existing.id,
        })
        .update({
          codeHash,
          attempts: 0,
          used: false,
          expiresAt,
        });
    } else {
      await this.prisma.db.orm.public.OtpCode.create({
        phone,
        codeHash,
        attempts: 0,
        used: false,
        expiresAt,
      });
    }

    /*
     * We don't have an SMS provider yet.
     *
     * During development only,
     * return the OTP so we can test.
     */
    if (
      process.env.NODE_ENV === "true"
    ) {
      return {
        success: true,
        expiresInSeconds: 300,
        devCode: code,
      };
    }

    return {
      success: true,
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
  ) {
    const phone =
      dto.phone.trim();

    const otp =
      await this.prisma.db.orm.public.OtpCode.first({
        phone,
      });

    if (!otp) {
      throw new UnauthorizedException(
        'Invalid or expired code',
      );
    }

    if (otp.used) {
      throw new UnauthorizedException(
        'Invalid or expired code',
      );
    }

    if (otp.attempts >= 5) {
      throw new UnauthorizedException(
        'Too many attempts',
      );
    }

    const now =
      Temporal.Now.instant();

    if (
      Temporal.Instant.compare(
        otp.expiresAt,
        now,
      ) <= 0
    ) {
      throw new UnauthorizedException(
        'Code has expired',
      );
    }

    const submittedHash =
      this.hashOtp(
        phone,
        dto.code,
      );

    const valid =
      this.compareHashes(
        otp.codeHash,
        submittedHash,
      );

    if (!valid) {
      await this.prisma.db.orm.public.OtpCode
        .where({
          id: otp.id,
        })
        .update({
          attempts:
            otp.attempts + 1,
        });

      throw new UnauthorizedException(
        'Invalid code',
      );
    }

    const user =
      await this.prisma.db.transaction(
        async (tx) => {
          /*
           * Claim the OTP.
           *
           * The used:false condition prevents
           * the same OTP being verified twice.
           */
          const claimed =
            await tx.orm.public.OtpCode
              .where({
                id: otp.id,
                used: false,
              })
              .update({
                used: true,
              });

          if (!claimed) {
            throw new UnauthorizedException(
              'Code already used',
            );
          }

          let existingUser =
            await tx.orm.public.User.first({
              phone,
            });

          if (!existingUser) {
            existingUser =
              await tx.orm.public.User.create({
                phone,
              });
          }

          return existingUser;
        },
      );

    if (!user) {
      throw new BadRequestException(
        'Could not create user',
      );
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id,
        phone,
      });

    return {
      accessToken,

      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

    async getCurrentUser(
      userId: number,
    ) {
      const user =
        await this.prisma.db.orm.public.User.first({
          id: userId,
      });

    if (!user) {
      throw new UnauthorizedException(
        'User no longer exists',
      );
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}