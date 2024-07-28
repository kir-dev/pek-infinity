import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import yaml from 'yaml';

import { AppModule } from './app.module';

export async function bootstrap(): Promise<{
  app: NestExpressApplication;
  document: OpenAPIObject;
}> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app
    .setGlobalPrefix('api')
    .enableVersioning({ type: VersioningType.URI, defaultVersion: '4' });

  const config = new DocumentBuilder()
    .setVersion('v4')
    .setTitle('PÉK API')
    .setDescription('Profiles and Groups')
    .setContact('kir-dev', 'https://kir-dev.hu', 'hello@kir-dev.hu')
    .setExternalDoc(
      'Source Code (GitHub)',
      'https://github.com/kir-dev/pek-infinity',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  return { app, document };
}

export function writeDocument(document: OpenAPIObject): void {
  const openApiLogger = new Logger('OpenApiGenerator');
  const PATH = join(__dirname, '..', 'openapi.yaml');

  openApiLogger.log('Writing openapi.yaml');
  writeFileSync(PATH, yaml.stringify(document), {
    encoding: 'utf-8',
    flag: 'w',
  });
}
