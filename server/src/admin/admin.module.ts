import {
  Module,
} from '@nestjs/common';

import {
  AuthModule,
} from '../auth/auth.module.js';

import {
  AdminProductsController,
} from './admin-products.controller.js';

import {
  AdminProductsService,
} from './admin-products.service.js';

import {
  R2StorageService,
} from '../storage/r2-storage.service.js';
import { AdminOrdersService } from './admin-orders.service.js';
import { AdminOrdersController } from './admin-orders.controller.js';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    AdminProductsController,
    AdminOrdersController,
  ],

  providers: [
    AdminProductsService,
    R2StorageService,
    AdminOrdersService
  ],
})
export class AdminModule {}