'use client';
import axios from 'axios';

import { AbstractPekApi } from './abstract-api';

export const clientAxios = axios.create({
  withCredentials: true,
});

export class ClientPekApi extends AbstractPekApi {
  constructor(basePath: string) {
    super(basePath, clientAxios);
  }
}
