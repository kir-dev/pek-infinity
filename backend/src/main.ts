import { Logger } from '@nestjs/common';

import { bootstrap, writeDocument } from './app';

async function server(): Promise<void> {
  const { app, document } = await bootstrap();

  await app.listen(process.env.PORT ?? 3300);

  Logger.log(`Application is running on: ${await app.getUrl()}`);

  if (process.env.NODE_ENV !== 'production') {
    writeDocument(document);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises -- main function can't be awaited
server();
