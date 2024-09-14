import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (process.env.FORCE_LAMBDA_API !== '1' && process.env.VERCEL_ENV !== 'preview') {
    res.status(403).json({ message: 'Lambda API is disabled in this environment' });
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
