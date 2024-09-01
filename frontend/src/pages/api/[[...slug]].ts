import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (process.env.VERCEL_ENV !== 'preview') {
    res.status(404).end();
    return;
  }
  const { bootstrap } = await import('backend/dist/app.js');
  const { app } = await bootstrap();
  const server = (await app.init()).getHttpAdapter().getInstance();

  return new Promise<void>((resolve) => {
    res.on('finish', () => {
      resolve();
    });

    server(req, res);
  });
}
