import 'dotenv/config';

import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { AdminModule } from './admin/admin.module.js';

export const { ObserveModule, ObserveInstrument } =
  createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY!,
      appSecret: process.env.OBSERVE_APP_SECRET!,
      serviceId: 'server',
    }),

    PrismaModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    AddressesModule,
    FavoritesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}