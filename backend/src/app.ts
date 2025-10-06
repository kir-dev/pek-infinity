import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app
    .setGlobalPrefix('api')
    .enableVersioning({ type: VersioningType.URI, defaultVersion: '4' });

  return app;
}
