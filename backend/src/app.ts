import { readFileSync, writeFileSync } from 'node:fs';
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

import { FRONTEND_CALLBACK } from '@/config/environment.config';

import { AppModule } from './app.module';
import { capitalize } from './utils/capitalize';

export async function bootstrap(): Promise<{
  app: NestExpressApplication;
  document: OpenAPIObject;
}> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app
    .setGlobalPrefix('api')
    .enableVersioning({ type: VersioningType.URI, defaultVersion: '4' })
    .enableCors({
      origin: FRONTEND_CALLBACK,
      credentials: true,
    });

  const config = new DocumentBuilder()
    .setVersion('v4')
    .setTitle('PÉK API')
    .setDescription('Profiles and Groups')
    .setContact('kir-dev', 'https://kir-dev.hu', 'hello@kir-dev.hu')
    .setExternalDoc(
      'Source Code (GitHub)',
      'https://github.com/kir-dev/pek-infinity',
    )
    .addCookieAuth('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controller, method, version) =>
      `${capitalize(controller.replace('Controller', ''))}${capitalize(method)}${version === 'v4' ? '' : version}`,
  });
  SwaggerModule.setup('api', app, document);

  return { app, document };
}

export function writeDocument(document: OpenAPIObject): void {
  const openApiLogger = new Logger('OpenApiGenerator');
  const PATH = join(__dirname, '../..', 'openapi.yaml');

  const newDocument = yaml.stringify(document);
  let currentDocument = '';
  try {
    currentDocument = readFileSync(PATH, { encoding: 'utf-8', flag: 'r' });
  } catch {
    openApiLogger.log('No openapi.yaml found');
  }

  if (newDocument === currentDocument) {
    openApiLogger.log('No changes in openapi.yaml');
    return;
  }

  openApiLogger.log('Updating openapi.yaml');
  writeFileSync(PATH, yaml.stringify(document), {
    encoding: 'utf-8',
    flag: 'w',
  });
}
