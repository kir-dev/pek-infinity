import { Logger } from '@nestjs/common';
import { createApp } from './app';

async function bootstrap() {
  const app = await createApp();

  await app.listen(process.env.PORT ?? 3000);

  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
