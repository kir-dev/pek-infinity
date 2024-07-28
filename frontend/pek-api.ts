import { Configuration, DefaultApi } from '../pek-client';

function getBasePath(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_ENV === 'preview') {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- if VERCEL_ENV is preview, VERCEL_URL is set
    return `https://${process.env.VERCEL_URL!}`;
  }
  return 'http://localhost:3000';
}

// // eslint-disable-next-line no-console -- .
// console.log('API URL:', getBasePath());

export class PekApi {
  private get api(): DefaultApi {
    return new DefaultApi(new Configuration({ basePath: getBasePath() }));
  }

  async ping(): Promise<string> {
    const { data } = await this.api.pingControllerSend();
    return data.ping;
  }
}
