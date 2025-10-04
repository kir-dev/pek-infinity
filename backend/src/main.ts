import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { createApp } from './app';

async function bootstrap() {
  const { app, document } = await createApp();

  // Generate OpenAPI spec to workspace root
  writeDocument(document);

  await app.listen(process.env.PORT ?? 3000);
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
