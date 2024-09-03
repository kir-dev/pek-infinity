import { AxiosInstance } from 'axios';

import { Configuration, DefaultApi, UserDto } from '@/pek';

export class AbstractPekApi {
  constructor(
    public readonly basePath: string,
    public readonly axios?: AxiosInstance
  ) {}

  get loginPath() {
    return `${this.basePath}/api/v4/auth/login`;
  }

  private get api(): DefaultApi {
    return new DefaultApi(new Configuration({ basePath: this.basePath }), this.basePath, this.axios);
  }

  async ping(): Promise<string> {
    const { data } = await this.api.pingControllerSend();
    return data.ping;
  }

  async me(): Promise<UserDto> {
    const { data } = await this.api.authControllerMe();
    return data;
  }
}
