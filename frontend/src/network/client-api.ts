'use client';
import axios from 'axios';
import Cookies from 'js-cookie';

import { AbstractPekApi } from './abstract-api';

export const clientAxios = axios.create();
clientAxios.interceptors.request.use((config) => {
  const jwt = Cookies.get('jwt');
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

export class ClientPekApi extends AbstractPekApi {
  constructor(basePath: string) {
    super(basePath, clientAxios);
  }
}
