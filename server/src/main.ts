import 'dotenv/config';

import {
  ValidationPipe,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import {
  AppModule,
  ObserveInstrument,
} from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://zingy-puffpuff-8fbeb7.netlify.app/',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(
    Number(process.env.PORT) || 4000,
    '0.0.0.0',
  );
}

void bootstrap();