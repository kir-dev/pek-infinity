import { bootstrap } from 'backend/dist/app.js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { app } = await bootstrap();
  const server = (await app.init()).getHttpAdapter().getInstance();

  return new Promise<void>((resolve) => {
    res.on('finish', () => {
      resolve();
    });

    server(req, res);
  });
}
