'use client';
import axios from 'axios';

import { AbstractPekApi } from './abstract-api';

export const clientAxios = axios.create({
  withCredentials: true,
});

export class ClientPekApi extends AbstractPekApi {
  constructor() {
    let apiBasePath: string;

    if (typeof window === 'undefined') apiBasePath = process.env.NEXT_PUBLIC_API_URL!;
    else apiBasePath = (window as any).config.apiBasePath;

    super(apiBasePath, clientAxios);
  }
}
