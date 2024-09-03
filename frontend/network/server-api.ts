import axios from 'axios';
import { cookies } from 'next/headers';

import { getBackend } from '@/app/actions';

import { AbstractPekApi } from './abstract-api';

export const serverAxios = axios.create();
serverAxios.interceptors.request.use((config) => {
  config.headers.cookie = cookies().toString();
  return config;
});

export class ServerPekApi extends AbstractPekApi {
  constructor(basePath: string) {
    super(basePath, serverAxios);
  }

  static async getDefault(): Promise<ServerPekApi> {
    const basePath = await getBackend({ preferredNetwork: 'private' });
    return new ServerPekApi(basePath);
  }
}
