import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { createApp } from './app';
import { capitalize } from './utils/capitalize';

async function bootstrap() {
  const app = await createApp();

  const config = new DocumentBuilder()
    .setTitle('PEK Infinity API')
    .setDescription('API for PEK Infinity project')
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controller, method, version) =>
      `${capitalize(controller.replace('Controller', ''))}${capitalize(method)}${version === 'v4' ? '' : (version ?? '')}`,
  });
  SwaggerModule.setup('api', app, document);

  // Generate OpenAPI spec to workspace root
  writeDocument(document);

  await app.listen(process.env.PORT ?? 3000);

  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

function writeDocument(document: OpenAPIObject) {
  const OPENAPI_FILE = join(__dirname, '../../openapi.json');
  const openApiLogger = new Logger('OpenApiGenerator');

  const newContent = JSON.stringify(document, null, 2);
  try {
    const existingContent = readFileSync(OPENAPI_FILE, 'utf-8');
    if (existingContent === newContent) {
      openApiLogger.log('Spec has no changes, skipping update');
      return;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      openApiLogger.log('Spec does not exist, creating it');
    } else {
      throw error;
    }
  }

  openApiLogger.log('Updating spec file');
  writeFileSync(OPENAPI_FILE, newContent, 'utf-8');
}
